import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC } from 'react';

import usePreviouslySelectedResearchField from '@/components/ResearchFieldSelector/PreviouslySelectedResearchField/hooks/usePreviouslySelectedResearchField';
import { Node } from '@/services/backend/types';

type PreviouslySelectedResearchFieldProps = {
    handleFieldSelect: (selected: Node, submit: boolean) => void;
    selectedResearchField: string;
};
const PreviouslySelectedResearchField: FC<PreviouslySelectedResearchFieldProps> = ({ handleFieldSelect, selectedResearchField }) => {
    const { researchFields } = usePreviouslySelectedResearchField();

    return (
        <div className="mb-2">
            {researchFields.length > 0 && (
                <>
                    <h3 className="font-bold text-lg mt-1">
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <span>
                                    Recent fields <FontAwesomeIcon icon={faQuestionCircle} className="text-accent" />
                                </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content showArrow>
                                <Tooltip.Arrow />
                                Based on your 8 most recently added papers
                            </Tooltip.Content>
                        </Tooltip>
                    </h3>

                    <div className="flex flex-wrap">
                        {researchFields.map((rf) => (
                            <Button
                                key={rf.id}
                                variant={selectedResearchField === rf.id ? 'primary' : 'outline'}
                                onPress={() => handleFieldSelect(rf, true)}
                                className="mr-2 mb-2 text-left rounded-full"
                                size="sm"
                            >
                                {rf.label}
                            </Button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PreviouslySelectedResearchField;
