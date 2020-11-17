import React, { useEffect, useState } from 'react';
import { Button, Card, ListGroup, ListGroupItem, CardDeck } from 'reactstrap';
import { getStatementsBySubjectAndPredicate, getParentResearchFields } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { resourcesUrl } from 'services/backend/resources';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, PREDICATES, MISC } from 'constants/graphSettings';
import { useSelector, useDispatch } from 'react-redux';
import { updateResearchField, nextStep, previousStep } from 'actions/addPaper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import flattenDeep from 'lodash/flattenDeep';

const ListGroupItemTransition = styled(CSSTransition)`
    &.fadeIn-enter,
    &.fadeIn-appear {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active,
    &.fadeIn-appear.fadeIn-appear-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    transition: 0.3s background-color, 0.3s border-color;
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
    cursor: pointer;
    border-radius: 0 !important; //overwrite bootstrap border radius since a card is used to display the lists
`;

const FieldSelector = styled(Card)`
    max-width: 260px;
    overflow-y: auto;
`;

/**
 * Component for selecting the research field of a paper
 * This might be redundant in the future, if the research field can be derived from the research problem
 */
function ResearchField() {
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const selectedResearchField = useSelector(state => state.addPaper.selectedResearchField);
    const researchFields = useSelector(state => state.addPaper.researchFields);

    const dispatch = useDispatch();

    useEffect(() => {
        // select the main field is none is selected yet (i.e. first time visiting this step)
        if (selectedResearchField === '') {
            getFields(MISC.RESEARCH_FIELD_MAIN, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextClick = () => {
        if (selectedResearchField === MISC.RESEARCH_FIELD_MAIN) {
            setShowError(true);
            return;
        }
        dispatch(nextStep());
    };

    const handleFieldClick = (fieldId, currentLevel) => {
        getFields(fieldId, currentLevel + 1);
    };

    const handleFieldSelect = selected => {
        setIsLoading(true);
        getParentResearchFields(selected.id).then(parents => {
            parents = parents.reverse();
            Promise.all(
                parents.map((parent, i) =>
                    getStatementsBySubjectAndPredicate({
                        subjectId: parent.id,
                        predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD
                    }).then(res =>
                        res
                            .map(elm => ({
                                label: elm.object.label,
                                id: elm.object.id,
                                active: elm.object.id === parents[i + 1]?.id ? true : false
                            }))
                            .sort((a, b) => {
                                // sort research fields alphabetically
                                return a.label.localeCompare(b.label);
                            })
                    )
                )
            ).then(data => {
                dispatch(
                    updateResearchField({
                        researchFields: data,
                        selectedResearchField: selected.id
                    })
                );
                setIsLoading(false);
            });
        });
    };

    const getFields = (fieldId, level) => {
        setIsLoading(true);
        getStatementsBySubjectAndPredicate({
            subjectId: fieldId,
            predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD
        }).then(res => {
            let subResearchFields = [];

            res.forEach(elm => {
                subResearchFields.push({
                    label: elm.object.label,
                    id: elm.object.id,
                    active: false
                });
            });

            // sort research fields alphabetically
            subResearchFields = subResearchFields.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
            let researchFieldsNew = [...researchFields];
            researchFieldsNew[level] = subResearchFields;

            // add active to selected field
            if (researchFieldsNew[level - 1] !== undefined) {
                researchFieldsNew[level - 1].forEach((elm, index) => {
                    researchFieldsNew[level - 1][index]['active'] = elm.id === fieldId;
                });
            }

            // hide all higher level research fields (in case a lower level research field has been selected again)
            researchFieldsNew = researchFieldsNew.filter((elm, index) => index <= level);
            setIsLoading(false);
            return dispatch(
                updateResearchField({
                    researchFields: researchFieldsNew,
                    selectedResearchField: fieldId
                })
            );
        });
    };

    let researchFieldLabel;
    if (researchFields && researchFields.length > 0) {
        const rF = flattenDeep(researchFields).find(rf => rf.id === selectedResearchField);
        researchFieldLabel = rF ? rF.label : selectedResearchField;
    }

    return (
        <div>
            <h2 className="h4 mt-4 mb-4">Select the research field</h2>
            <p className="text-muted">Select a close research field to the paper from the list.</p>
            <div className="mb-4">
                <Autocomplete
                    requestUrl={resourcesUrl}
                    optionsClass={CLASSES.RESEARCH_FIELD}
                    placeholder="Search for fields"
                    onItemSelected={handleFieldSelect}
                    value={selectedResearchField !== MISC.RESEARCH_FIELD_MAIN ? { id: selectedResearchField, label: researchFieldLabel } : null}
                    allowCreate={false}
                    autoLoadOption={true}
                />
            </div>
            <p className="text-muted">
                The research field can be selected from a hierarchical structure of fields and their subfields.{' '}
                {isLoading && <Icon icon={faSpinner} spin />}
            </p>

            <CardDeck>
                {researchFields.length > 0 &&
                    researchFields.map((fields, level) => {
                        return fields && fields.length > 0 ? (
                            <FieldSelector className="fieldSelector" key={level}>
                                <ListGroup flush>
                                    <TransitionGroup exit={false}>
                                        {fields.map(field => (
                                            <ListGroupItemTransition key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                                <ListGroupItemStyled
                                                    style={{ display: 'flex' }}
                                                    className="align-items-start"
                                                    active={field.active}
                                                    onClick={() => handleFieldClick(field.id, level)}
                                                >
                                                    <div>{field.label}</div>
                                                    {field.active &&
                                                        level < researchFields.length - 1 &&
                                                        researchFields[level + 1] &&
                                                        researchFields[level + 1].length > 0 && (
                                                            <Icon
                                                                size="1x"
                                                                style={{ marginLeft: 'auto' }}
                                                                className="flex-shrink-0  align-self-center"
                                                                icon={faAngleDoubleRight}
                                                            />
                                                        )}
                                                </ListGroupItemStyled>
                                            </ListGroupItemTransition>
                                        ))}
                                    </TransitionGroup>
                                </ListGroup>
                            </FieldSelector>
                        ) : (
                            ''
                        );
                    })}
            </CardDeck>

            {researchFieldLabel && selectedResearchField !== MISC.RESEARCH_FIELD_MAIN ? (
                <div className="mt-5 mb-3">
                    Selected research field: <b>{researchFieldLabel}</b>
                </div>
            ) : (
                <p className={`text-danger mt-2 pl-2 ${!showError ? ' d-none' : ''}`} style={{ borderLeft: '4px red solid' }}>
                    Please select the research field
                </p>
            )}

            <hr className="mt-5 mb-3" />

            <Button color="primary" className="float-right mb-4" onClick={handleNextClick}>
                Next step
            </Button>
            <Button color="light" className="float-right mb-4 mr-2" onClick={() => dispatch(previousStep())}>
                Previous step
            </Button>
        </div>
    );
}

ResearchField.propTypes = {};

export default ResearchField;
