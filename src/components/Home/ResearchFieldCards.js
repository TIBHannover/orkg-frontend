import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getResearchFieldsStats } from 'services/backend/stats';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { MISC, CLASSES } from 'constants/graphSettings';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { resourcesUrl } from 'services/backend/resources';
import PropTypes from 'prop-types';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

const Card = styled.div`
    cursor: pointer;
    background: #e86161 !important;
    color: #fff !important;
    border: 0 !important;
    border-radius: 12px !important;
    min-height: 85px;
    flex: 0 0 calc(20% - 20px) !important;
    margin: 10px;
    transition: opacity 0.2s;
    justify-content: center;
    display: flex;
    flex: 1 1 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 140px;
    word-wrap: break-word;

    &:hover {
        opacity: 0.8;
    }
    &[disabled] {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
    }
    &:active {
        top: 4px;
    }

    @media (max-width: 400px) {
        flex: 0 0 80% !important;
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding: 0 5px;
`;

const PaperAmount = styled.div`
    opacity: 0.5;
    font-size: 80%;
    text-align: center;
`;

const AnimationContainer = styled(CSSTransition)`
    //transition: 0.3s background-color, 0.3s border-color;

    animation: scale-up-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    @keyframes scale-up-center {
        0% {
            transform: scale(0.5);
        }
        100% {
            transform: scale(1);
        }
    }
`;

const ResearchFieldCards = ({ selectedResearchField, handleFieldSelect, researchFields, isLoading }) => {
    const [stats, setStats] = useState(null);
    const rfAutocompleteRef = useRef(null);
    useEffect(() => {
        fetchResearchFieldsStats();
    }, []);

    const fetchResearchFieldsStats = () => {
        return getResearchFieldsStats().then(results => {
            setStats(results);
        });
    };

    return (
        <>
            <div className="row">
                <h1 className="col-8 h5 flex-shrink-0 mb-0">
                    <Icon icon={faStream} className="text-primary" /> Browse by research field
                </h1>
                <div className="col-4 flex-end">
                    <Autocomplete
                        requestUrl={resourcesUrl}
                        optionsClass={CLASSES.RESEARCH_FIELD}
                        placeholder="Search for fields..."
                        onItemSelected={selected => {
                            // blur the field allows to focus and open the menu again
                            rfAutocompleteRef.current && rfAutocompleteRef.current.blur();
                            handleFieldSelect(selected);
                        }}
                        value={selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN ? selectedResearchField : null}
                        allowCreate={false}
                        autoLoadOption={true}
                        cssClasses="form-control-sm"
                        isDisabled={isLoading}
                        innerRef={rfAutocompleteRef}
                    />
                </div>
            </div>
            {researchFields.length > 0 && (
                <div className="mt-3">
                    <hr className="mt-3 mb-3" />
                    <div>
                        <TransitionGroup id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap" exit={false}>
                            {researchFields.map(field => {
                                return (
                                    <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                        <Card role="button" disabled={stats[field.id] === 0} onClick={() => handleFieldSelect(field)}>
                                            <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                                            <PaperAmount>{stats[field.id]} papers</PaperAmount>
                                        </Card>
                                    </AnimationContainer>
                                );
                            })}
                        </TransitionGroup>
                    </div>
                </div>
            )}
        </>
    );
};

ResearchFieldCards.propTypes = {
    selectedResearchField: PropTypes.object,
    researchFields: PropTypes.array,
    handleFieldSelect: PropTypes.func,
    isLoading: PropTypes.bool.isRequired
};

export default ResearchFieldCards;
