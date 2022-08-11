import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import usePreviouslySelectedResearchField from './hooks/usePreviouslySelectedResearchField';

const PreviouslySelectedResearchField = props => {
    const { researchFields } = usePreviouslySelectedResearchField();

    return (
        <div className="mb-2">
            {researchFields.length > 0 && (
                <>
                    <h3 className="fw-bold h6 mt-1">
                        <Tippy content="Based on your 8 most recently added papers">
                            <span>
                                Recent fields <Icon icon={faQuestionCircle} className="text-primary" />
                            </span>
                        </Tippy>
                    </h3>

                    <div className="d-flex flex-wrap">
                        {researchFields.map(rf => (
                            <Button
                                key={rf.id}
                                color="light"
                                onClick={() => props.handleFieldSelect(rf, true)}
                                className={`me-2 mb-2 text-start rounded-pill ${props.selectedResearchField === rf.id ? 'active' : ''}`}
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

PreviouslySelectedResearchField.propTypes = {
    handleFieldSelect: PropTypes.func,
    selectedResearchField: PropTypes.string,
};

export default PreviouslySelectedResearchField;
