import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import usePreviouslySelectedResearchField from 'components/ResearchFieldSelector/PreviouslySelectedResearchField/hooks/usePreviouslySelectedResearchField';
import { FC } from 'react';
import { Button } from 'reactstrap';
import { Node } from 'services/backend/types';

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
                    <h3 className="fw-bold h6 mt-1">
                        <Tooltip content="Based on your 8 most recently added papers">
                            <span>
                                Recent fields <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
                            </span>
                        </Tooltip>
                    </h3>

                    <div className="d-flex flex-wrap">
                        {researchFields.map((rf) => (
                            <Button
                                key={rf.id}
                                color="light"
                                onClick={() => handleFieldSelect(rf, true)}
                                className={`me-2 mb-2 text-start rounded-pill ${selectedResearchField === rf.id ? 'active' : ''}`}
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
