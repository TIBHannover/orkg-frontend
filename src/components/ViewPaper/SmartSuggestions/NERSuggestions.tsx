import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { capitalize } from 'lodash';
import { FC, Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'react-use';
import { mutate } from 'swr';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useParams from '@/components/useParams/useParams';
import useEntityRecognition from '@/components/ViewPaper/hooks/useEntityRecognition';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { ENTITIES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement, statementsUrl } from '@/services/backend/statements';
import { determineActiveNERService, getNerResults, saveFeedback } from '@/services/orkgNlp';
import { RootStore } from '@/slices/types';
import { setNerProperties, setNerRawResponse, setNerResources } from '@/slices/viewPaperSlice';

type NERSuggestionsProps = {
    resourceId: string;
    title?: string;
    abstract?: string;
};

type Suggestion = {
    id?: string;
    label: string;
    isExistingValue?: boolean;
};

const NERSuggestions: FC<NERSuggestionsProps> = ({ title = '', abstract = '', resourceId }) => {
    const { resourceId: paperId } = useParams();
    const { paper } = useViewPaper({ paperId });
    const nerProperties = useSelector((state: RootStore) => state.viewPaper.nerProperties);
    const dispatch = useDispatch();
    const [activeNERService, setActiveNERService] = useState<string | null>(null);

    const { suggestions } = useEntityRecognition({ activeNERService, title, abstract, resourceId }) as unknown as {
        suggestions: Record<string, Suggestion[]>;
    };
    const researchField = paper?.research_fields?.[0];

    useEffect(() => {
        (async () => setActiveNERService(await determineActiveNERService(researchField?.id ?? '')))();
    }, [researchField]);

    useDebounce(
        () => {
            const processNlpData = async () => {
                if (!activeNERService) return;
                const data = await getNerResults({ title, abstract, service: activeNERService });
                dispatch(setNerResources(data.resources));
                dispatch(setNerProperties(data.properties));
                dispatch(setNerRawResponse(data.response));
            };
            processNlpData();
        },
        500,
        [abstract, dispatch, title],
    );

    const handleInsert = async ({ property, resource }: { property: string; resource: Suggestion }) => {
        const objId = await createResource({ label: resource.label, classes: [] });
        await createResourceStatement(resourceId, property, objId);
        mutate([
            {
                subjectId: resourceId,
                returnContent: true,
                returnFormattedLabels: true,
            },
            statementsUrl,
            'getStatements',
        ]);

        try {
            if (activeNERService) {
                saveFeedback({
                    request: { title, abstract },
                    response: { property, resource },
                    serviceName: activeNERService,
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const hasSuggestions = Object.keys(suggestions).some((key) => suggestions[key].length > 0);

    if (!hasSuggestions) {
        return null;
    }

    return (
        <div className="mt-4 pt-3 border-t border-border">
            <div className="text-sm font-semibold mb-2">Statements</div>
            <div className="flex flex-col gap-3">
                {Object.keys(suggestions).map((key) =>
                    suggestions[key].length > 0 ? (
                        <Fragment key={key}>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-smart-darker mb-1">
                                    <DescriptionTooltip id={nerProperties?.[key]?.id} _class={ENTITIES.PREDICATE} showURL>
                                        {capitalize(nerProperties?.[key]?.label)}
                                    </DescriptionTooltip>
                                </div>
                                <div className="flex flex-col rounded-md border border-border overflow-hidden divide-y divide-border bg-surface">
                                    <AnimatePresence>
                                        {suggestions[key].map((item, index) => (
                                            <motion.button
                                                type="button"
                                                key={item.id || item.label}
                                                className="group text-left px-3 py-2 text-sm bg-transparent hover:bg-[color-mix(in_srgb,var(--color-smart)_10%,var(--surface))] cursor-pointer transition-colors flex items-center gap-2"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -30 }}
                                                transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                                                onClick={() => handleInsert({ property: key, resource: item })}
                                            >
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-smart/15 text-smart-darker shrink-0 group-hover:bg-smart group-hover:text-white transition-colors">
                                                    <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
                                                </span>
                                                <span className="min-w-0 break-words">
                                                    <DescriptionTooltip
                                                        id={item.isExistingValue ? item.id : undefined}
                                                        _class={ENTITIES.RESOURCE}
                                                        showURL={item.isExistingValue}
                                                    >
                                                        {item.label}
                                                    </DescriptionTooltip>
                                                </span>
                                            </motion.button>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Fragment>
                    ) : null,
                )}
            </div>
        </div>
    );
};

export default NERSuggestions;
