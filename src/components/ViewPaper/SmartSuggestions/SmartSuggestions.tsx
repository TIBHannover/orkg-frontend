import { faExclamationTriangle, faMagic, faPen, faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

import AbstractAnnotatorModal from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotatorModal';
import AbstractModal from '@/components/ViewPaper/AbstractModal/AbstractModal';
import Bioassays from '@/components/ViewPaper/BioassaysModal/Bioassays';
import NERSuggestions from '@/components/ViewPaper/SmartSuggestions/NERSuggestions';
import { SuggestionsBox } from '@/components/ViewPaper/SmartSuggestions/styled';
import TemplatesRecommendations from '@/components/ViewPaper/SmartSuggestions/TemplatesRecommendations';

type SmartSuggestionsProps = {
    isLoadingAbstract?: boolean;
    title?: string;
    abstract?: string;
    resourceId: string;
};

const wrapWithWarningTooltip = (showWarning: boolean, children: ReactNode) =>
    showWarning ? (
        <Tooltip delay={0}>
            <Tooltip.Trigger>{children}</Tooltip.Trigger>
            <Tooltip.Content showArrow placement="end" className="max-w-[300px]">
                <Tooltip.Arrow />
                We were unable to fetch the abstract of the paper. Click the button to manually add it, this improves the suggestions.
            </Tooltip.Content>
        </Tooltip>
    ) : (
        children
    );

const SmartSuggestions: FC<SmartSuggestionsProps> = ({ isLoadingAbstract, title = '', abstract = '', resourceId }) => {
    const [isOpenAbstractModal, setIsOpenAbstractModal] = useState(false);
    const [isOpenAbstractAnnotationModal, setIsOpenAbstractAnnotationModal] = useState(false);

    const showAbstractWarning = !isLoadingAbstract && !abstract;

    return (
        <SuggestionsBox className="rounded">
            <div className="text-base font-semibold mb-3 inline-flex items-center gap-1">
                Suggestions
                <Tooltip delay={0}>
                    <Tooltip.Trigger>
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help text-sm" />
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow className="max-w-[300px]">
                        <Tooltip.Arrow />
                        The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these
                        suggestions is optional.
                    </Tooltip.Content>
                </Tooltip>
            </div>
            <div className="flex flex-col gap-2 w-full">
                {wrapWithWarningTooltip(
                    showAbstractWarning,
                    <span className="block">
                        <Button
                            variant="outline"
                            isDisabled={isLoadingAbstract}
                            className="w-full"
                            onPress={() => setIsOpenAbstractModal(true)}
                            size="sm"
                        >
                            {isLoadingAbstract ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-1 text-muted" /> Loading abstract
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon
                                        icon={showAbstractWarning ? faExclamationTriangle : faPen}
                                        className={`mr-1 ${showAbstractWarning ? 'text-warning' : 'text-muted'}`}
                                    />{' '}
                                    Paper abstract
                                </>
                            )}
                        </Button>
                    </span>,
                )}
                {abstract && (
                    <Button onPress={() => setIsOpenAbstractAnnotationModal(true)} variant="outline" size="sm" className="button--orkg-smart w-full">
                        <FontAwesomeIcon icon={faMagic} className="mr-1" /> Annotator
                    </Button>
                )}
                <Bioassays resourceId={resourceId} />
            </div>
            <NERSuggestions title={title} abstract={abstract} resourceId={resourceId} />
            <TemplatesRecommendations title={title} abstract={abstract} resourceId={resourceId} />
            {isOpenAbstractModal && <AbstractModal toggle={() => setIsOpenAbstractModal((v) => !v)} />}
            {isOpenAbstractAnnotationModal && (
                <AbstractAnnotatorModal resourceId={resourceId} toggle={() => setIsOpenAbstractAnnotationModal((v) => !v)} />
            )}
        </SuggestionsBox>
    );
};

export default SmartSuggestions;
