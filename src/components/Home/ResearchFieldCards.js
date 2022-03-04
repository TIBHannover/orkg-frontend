import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getResearchFieldsStats } from 'services/backend/stats';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { MISC, CLASSES } from 'constants/graphSettings';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { resourcesUrl } from 'services/backend/resources';
import { has } from 'lodash';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { reverseWithSlug } from 'utils';

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

const ArrowCards = styled.div`
    background: transparent;
    position: absolute;
    left: 0px;
    transform: translate(89px);
    bottom: -15px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid #fff;
    filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.13));
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

const ShowMore = styled(Card)`
    background: ${props => props.theme.light}!important;
    color: ${props => props.theme.bodyColor} !important;
    text-align: center;
`;

const ResearchFieldCards = ({ selectedResearchField, handleFieldSelect, researchFields, isLoading }) => {
    const [stats, setStats] = useState(null);
    const rfAutocompleteRef = useRef(null);
    const [showMoreFields, setShowMoreFields] = useState(false);

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
            <div className="row" style={{ position: 'relative' }}>
                <h1 className="col-md-8 h5 flex-shrink-0 mb-0">
                    <Icon icon={faStream} className="text-primary" /> Browse by research field
                </h1>
                <div className="col-md-4 mt-2 mt-md-0 flex-row-reverse d-flex">
                    <div>
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
                    {selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN && (
                        <Button
                            tag={Link}
                            to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                researchFieldId: selectedResearchField.id,
                                slug: selectedResearchField.label
                            })}
                            color="light"
                            size="sm"
                            className="flex-shrink-0 me-2"
                        >
                            Visit field page
                        </Button>
                    )}
                </div>
            </div>
            <hr className="mt-3 mb-1" />
            {MISC.RESEARCH_FIELD_MAIN !== selectedResearchField.id && (
                <>
                    <Breadcrumbs backgroundWhite researchFieldId={selectedResearchField.id} onFieldClick={handleFieldSelect} disableLastField />
                    <hr className="mt-1 mb-1" />
                </>
            )}
            {!isLoading && stats && researchFields.length > 0 && (
                <div className="mt-3">
                    <div>
                        <TransitionGroup id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap" exit={false}>
                            {researchFields.slice(0, 9).map(field => {
                                return (
                                    <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                        <Card
                                            role="button"
                                            disabled={has(stats, field.id) && stats[field.id] === 0}
                                            onClick={() => handleFieldSelect(field)}
                                        >
                                            <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                                            <PaperAmount>{has(stats, field.id) ? stats[field.id] : 0} papers</PaperAmount>
                                        </Card>
                                    </AnimationContainer>
                                );
                            })}
                            {researchFields.length > 9 &&
                                showMoreFields &&
                                researchFields.slice(9).map(field => (
                                    <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                        <Card
                                            role="button"
                                            disabled={has(stats, field.id) && stats[field.id] === 0}
                                            onClick={() => handleFieldSelect(field)}
                                        >
                                            <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                                            <PaperAmount>{has(stats, field.id) ? stats[field.id] : 0} papers</PaperAmount>
                                        </Card>
                                    </AnimationContainer>
                                ))}
                            {researchFields.length > 9 && (
                                <AnimationContainer classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                    <ShowMore role="button" onClick={() => setShowMoreFields(v => !v)}>
                                        {showMoreFields ? 'Show less fields' : 'Show more fields...'}
                                    </ShowMore>
                                </AnimationContainer>
                            )}
                        </TransitionGroup>
                    </div>
                </div>
            )}
            {selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN && <ArrowCards />}
            {isLoading && (
                <div className="mt-3">
                    <div>
                        <ContentLoader
                            height="10%"
                            width="100%"
                            viewBox="0 0 100 10"
                            style={{ width: '100% !important' }}
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                        >
                            <rect x="2" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="22" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="42" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="62" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="82" y="0" rx="2" ry="2" width="15" height="7" />
                        </ContentLoader>
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
