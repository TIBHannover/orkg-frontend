import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Chip, Tooltip } from '@heroui/react';
import capitalize from 'capitalize';
import toArray from 'lodash/toArray';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { OptionType } from '@/components/Autocomplete/types';
import AbstractAnnotator from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotator';
import TitleWarningAlert from '@/components/ViewPaper/AbstractModal/TitleWarningAlert';
import { RootStore } from '@/slices/types';

type AbstractAnnotatorViewProps = {
    predicateOptions: OptionType[];
    isAnnotationLoading: boolean;
    isAnnotationFailedLoading: boolean;
    getPredicateColor: (id: string) => string;
    annotationError: string;
};

const AbstractAnnotatorView: FC<AbstractAnnotatorViewProps> = ({
    predicateOptions,
    isAnnotationLoading,
    isAnnotationFailedLoading,
    getPredicateColor,
    annotationError,
}) => {
    const ranges = useSelector((state: RootStore) => state.viewPaper.ranges);
    const abstract = useSelector((state: RootStore) => state.viewPaper.abstract);
    const isAbstractLoading = useSelector((state: RootStore) => state.viewPaper.isAbstractLoading);
    const rangeArray = toArray(ranges);

    const rangesPredicates = [...new Set(rangeArray.map((r) => r.predicate.id))];

    return (
        <div className="flex flex-col gap-3">
            {abstract && !isAnnotationLoading && !isAnnotationFailedLoading && (
                <>
                    <TitleWarningAlert />
                    {rangesPredicates.length > 0 ? (
                        <Alert status="accent">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Annotations ready for review</Alert.Title>
                                <Alert.Description>
                                    We automatically annotated the abstract for you. Please remove any incorrect annotations.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    ) : (
                        <Alert status="accent">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>No concepts found</Alert.Title>
                                <Alert.Description>
                                    We could not find any concepts on the abstract. Please insert more text in the abstract.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}
                </>
            )}
            {!isAnnotationLoading && isAnnotationFailedLoading && (
                <Alert status="default">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Annotation service unavailable</Alert.Title>
                        <Alert.Description>
                            {annotationError || 'Failed to connect to the annotation service, please try again later.'}
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            {!isAbstractLoading && !isAnnotationLoading && (
                <div>
                    <div id="annotationBadges" className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium inline-flex items-center gap-1">
                            Annotation labels
                            <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help" />
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow>
                                    <Tooltip.Arrow />
                                    Annotation labels are the properties that will be used in the contribution data.
                                </Tooltip.Content>
                            </Tooltip>
                        </span>
                        {rangesPredicates.length > 0 &&
                            rangesPredicates.map((p) => {
                                const aconcept = p ? predicateOptions.find((e) => e.id === p) : undefined;
                                const sample = rangeArray.find((r) => r.predicate.id === p);
                                const labelText = aconcept?.label ?? sample?.predicate?.label ?? p;
                                const label = labelText ? capitalize(labelText) : 'Unlabeled';
                                const count = rangeArray.filter((rc) => rc.predicate.id === p).length;
                                const chip = (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
                                        style={{ color: '#333', background: getPredicateColor(p) }}
                                    >
                                        {label}
                                        <Chip color="default" className="rounded-full">
                                            {count}
                                        </Chip>
                                    </span>
                                );
                                if (aconcept) {
                                    return (
                                        <Tooltip key={`p${p}`} delay={0}>
                                            <Tooltip.Trigger>
                                                <span className="cursor-pointer">{chip}</span>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content showArrow>
                                                <Tooltip.Arrow />
                                                {aconcept.description}
                                            </Tooltip.Content>
                                        </Tooltip>
                                    );
                                }
                                return <span key={`p${p}`}>{chip}</span>;
                            })}
                    </div>
                    <AbstractAnnotator predicateOptions={predicateOptions} getPredicateColor={getPredicateColor} />
                </div>
            )}
        </div>
    );
};

export default AbstractAnnotatorView;
