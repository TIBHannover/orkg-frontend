import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { getAnnotations } from 'services/annotation/index';
import { useSelector, useDispatch } from 'react-redux';
import { createAnnotation, clearAnnotations, setAbstractDialogView, setAbstract as setAbstractGlobal } from 'slices/viewPaperSlice';
import { fillStatements } from 'slices/statementBrowserSlice';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faThList, faMagic } from '@fortawesome/free-solid-svg-icons';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import randomcolor from 'randomcolor';
import styled from 'styled-components';
import { guid } from 'utils';
import toArray from 'lodash/toArray';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import AbstractRangesList from 'components/ViewPaper/AbstractAnnotatorModal/AbstractRangesList';
import AbstractAnnotatorView from 'components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotatorView';
import AbstractInputView from 'components/ViewPaper/AbstractAnnotatorModal/AbstractInputView';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

const CLASS_OPTIONS = [
    {
        id: 'PROCESS',
        label: 'Process',
        description: 'Natural phenomenon, or independent/dependent activities.E.g., growing(Bio), cured(MS), flooding(ES).',
    },
    {
        id: 'DATA',
        label: 'Data',
        description:
            'The data themselves, or quantitative or qualitative characteristics of entities. E.g., rotational energy (Eng), tensile strength (MS), the Chern character (Mat).',
    },
    {
        id: 'MATERIAL',
        label: 'Material',
        description: 'A physical or digital entity used for scientific experiments. E.g., soil (Agr), the moon (Ast), the set (Mat).',
    },
    {
        id: 'METHOD',
        label: 'Method',
        description:
            'A commonly used procedure that acts on entities. E.g., powder X-ray (Che), the PRAM analysis (CS), magnetoencephalography (Med).',
    },
];

const CLASS_COLORS = {
    process: '#7fa2ff',
    data: '#9df28a',
    material: '#EAB0A2',
    method: '#D2B8E5',
};

function AbstractAnnotatorModal({ toggle }) {
    const [isAbstractLoading, setIsAbstractLoading] = useState(false);
    const [isAbstractFailedLoading, setIsAbstractFailedLoading] = useState(false);
    const [isAnnotationLoading, setIsAnnotationLoading] = useState(false);
    const [isAnnotationFailedLoading, setIsAnnotationFailedLoading] = useState(false);
    const [annotationError, setAnnotationError] = useState(null);
    const [certaintyThreshold, setCertaintyThreshold] = useState([0.5]);
    const [validation, setValidation] = useState(true);
    const [classColors, setClassColors] = useState(CLASS_COLORS);

    const abstractGlobal = useSelector(state => state.viewPaper.abstract);

    const [abstract, setAbstract] = useState(abstractGlobal);
    const dispatch = useDispatch();

    const abstractDialogView = useSelector(state => state.viewPaper.abstractDialogView);
    const ranges = useSelector(state => state.viewPaper.ranges);
    const selectedContributionId = useSelector(state => state.viewPaper.selectedContributionId);
    const properties = useSelector(state => state.statementBrowser.properties);
    const values = useSelector(state => state.statementBrowser.values);

    const getAnnotation = useCallback(() => {
        if (!abstract) {
            return Promise.resolve();
        }
        setIsAnnotationLoading(true);

        return getAnnotations(abstract)
            .then(data => {
                const annotated = [];
                const nRanges = {};
                if (data && data.entities) {
                    data.entities
                        .map(entity => {
                            const text = data.text.substring(entity[2][0][0], entity[2][0][1]);
                            if (annotated.indexOf(text.toLowerCase()) < 0) {
                                annotated.push(text.toLowerCase());
                                // Predicate label entity[1]
                                let rangeClass = CLASS_OPTIONS.filter(c => c.label.toLowerCase() === entity[1].toLowerCase());
                                if (rangeClass.length > 0) {
                                    [rangeClass] = rangeClass;
                                } else {
                                    rangeClass = { id: entity[1], label: entity[1] };
                                }
                                nRanges[entity[0]] = {
                                    text,
                                    start: entity[2][0][0],
                                    end: entity[2][0][1] - 1,
                                    certainty: entity[3],
                                    class: rangeClass,
                                    isEditing: false,
                                };
                                return nRanges[entity[0]];
                            }
                            return null;
                        })
                        .filter(r => r);
                }
                // Clear annotations
                dispatch(clearAnnotations());
                toArray(nRanges).map(range => dispatch(createAnnotation(range)));
                setIsAnnotationLoading(false);
                setIsAnnotationFailedLoading(false);
                setIsAbstractLoading(false);
                setIsAbstractFailedLoading(false);
            })
            .catch(e => {
                if (e.statusCode === 422) {
                    setAnnotationError('Failed to annotate the abstract, please change the abstract and try again');
                    setIsAnnotationLoading(false);
                    setIsAnnotationFailedLoading(true);
                } else {
                    setAnnotationError(null);
                    setIsAnnotationLoading(false);
                    setIsAnnotationFailedLoading(true);
                }
                return null;
            });
    }, [abstract, dispatch]);

    const handleChangeAbstract = () => {
        if (abstractDialogView === 'input') {
            if (abstract.replace(/^\s+|\s+$/g, '') === '' || abstract.replace(/^\s+|\s+$/g, '').split(' ').length <= 1) {
                setValidation(false);
                return;
            }
            getAnnotation();
        }
        dispatch(setAbstractGlobal(abstract));
        dispatch(setAbstractDialogView(abstractDialogView === 'input' ? 'annotator' : 'input'));
        setValidation(true);
    };

    useEffect(() => {
        if (abstractDialogView !== 'input') {
            getAnnotation();
        }
    }, [abstract, getAnnotation]);

    const getClassColor = rangeClass => {
        if (!rangeClass) {
            return '#ffb7b7';
        }
        if (classColors[rangeClass.toLowerCase()]) {
            return classColors[rangeClass.toLowerCase()];
        }
        const newColor = randomcolor({ luminosity: 'light', seed: rangeClass.toLowerCase() });
        setClassColors({ ...classColors, [rangeClass.toLowerCase()]: newColor });
        return newColor;
    };

    const getExistingPredicateId = property => {
        if (properties.allIds.length > 0) {
            const p = properties.allIds.filter(pId => properties.byId[pId].label === property.label);
            if (p.length > 0) {
                // Property Already exists
                return p[0];
            }
        }
        return false;
    };

    const getExistingRange = range => {
        if (properties.allIds.length > 0) {
            const p = properties.allIds.filter(pId => properties.byId[pId].label === range.class.label);
            if (p.length > 0) {
                // Property Already exists
                // Check value
                const v = properties.byId[p[0]].valueIds.filter(id => {
                    if (values.byId[id].label === range.text) {
                        return id;
                    }
                    return false;
                });
                if (v.length > 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleInsertData = () => {
        const classesID = {};
        const createdProperties = {};
        const statements = { properties: [], values: [] };
        const rangesArray = toArray(ranges).filter(r => r.certainty >= certaintyThreshold);
        if (rangesArray.length > 0) {
            rangesArray.map(async range => {
                let propertyId;
                if (!getExistingRange(range) && range.class.id) {
                    if (classesID[range.class.id]) {
                        propertyId = classesID[range.class.id];
                    } else {
                        const pID = guid();
                        classesID[range.class.id] = pID;
                        propertyId = pID;
                    }
                    if (!createdProperties[propertyId]) {
                        const existingPredicateId = getExistingPredicateId(range.class);
                        if (!existingPredicateId) {
                            let _existingPredicateId = CLASS_OPTIONS.find(_class => _class.id === range.class.id)?.id;
                            if (!_existingPredicateId && range.class.id.toLowerCase() !== range.class.label.toLowerCase()) {
                                _existingPredicateId = range.class.id;
                            }
                            statements.properties.push({
                                propertyId,
                                existingPredicateId: _existingPredicateId,
                                label: range.class.label,
                            });
                        } else {
                            propertyId = existingPredicateId;
                        }
                        createdProperties[propertyId] = propertyId;
                    }
                    statements.values.push({
                        label: range.text,
                        _class: ENTITIES.RESOURCE,
                        propertyId,
                    });
                }
                return null;
            });
        }
        // Add the statements to the selected contribution
        dispatch(fillStatements({ statements, resourceId: selectedContributionId, syncBackend: true }));
        toggle();
    };

    const handleChangeView = view => {
        dispatch(setAbstractDialogView(view));
    };

    let currentStepDetails = (
        <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
            <AbstractAnnotatorView
                certaintyThreshold={certaintyThreshold}
                isAbstractLoading={isAbstractLoading}
                isAnnotationLoading={isAnnotationLoading}
                isAnnotationFailedLoading={isAnnotationFailedLoading}
                handleChangeCertaintyThreshold={v => setCertaintyThreshold(v)}
                classOptions={CLASS_OPTIONS}
                annotationError={annotationError}
                getClassColor={getClassColor}
            />
        </AnimationContainer>
    );

    switch (abstractDialogView) {
        case 'input':
            currentStepDetails = (
                <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <AbstractInputView
                        validation={validation}
                        classOptions={CLASS_OPTIONS}
                        isAbstractLoading={isAbstractLoading}
                        isAbstractFailedLoading={isAbstractFailedLoading}
                        abstract={abstract}
                        setAbstract={setAbstract}
                    />
                </AnimationContainer>
            );
            break;
        case 'list':
            currentStepDetails = (
                <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <AbstractRangesList certaintyThreshold={certaintyThreshold} classOptions={CLASS_OPTIONS} getClassColor={getClassColor} />
                </AnimationContainer>
            );
            break;
        default:
            break;
    }

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Abstract annotator</ModalHeader>
            <ModalBody>
                <div className="clearfix">
                    {(isAbstractLoading || isAnnotationLoading) && (
                        <div className="text-center text-primary">
                            <span style={{ fontSize: 80 }}>
                                <Icon icon={faSpinner} spin />
                            </span>
                            <br />
                            <h2 className="h5">{isAbstractLoading ? 'Loading abstract...' : 'Loading annotations...'}</h2>
                        </div>
                    )}

                    <TransitionGroup exit={false}>{currentStepDetails}</TransitionGroup>
                </div>
            </ModalBody>
            <ModalFooter>
                {abstractDialogView === 'input' && (
                    <>
                        <Button color="primary" className="float-end" onClick={handleChangeAbstract}>
                            Annotate Abstract
                        </Button>
                    </>
                )}
                {abstractDialogView === 'list' ? (
                    <>
                        <Button color="secondary" outline className="float-start" onClick={() => handleChangeView('annotator')}>
                            <Icon icon={faMagic} /> Annotator
                        </Button>

                        <Button color="light" className="float-right mr-2" onClick={handleChangeAbstract}>
                            Change abstract
                        </Button>

                        <Button color="smart" className="float-right" onClick={handleInsertData}>
                            Insert Data
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="secondary" outline className="float-start" onClick={() => handleChangeView('list')}>
                            <Icon icon={faThList} /> List of annotations
                        </Button>
                        {abstractDialogView !== 'input' && (
                            <Button color="light" className="float-right mr-2" onClick={handleChangeAbstract}>
                                Change abstract
                            </Button>
                        )}
                        <Button color="smart" className="float-right" onClick={handleInsertData}>
                            Insert Data
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    );
}

AbstractAnnotatorModal.propTypes = {
    toggle: PropTypes.func.isRequired,
};

export default AbstractAnnotatorModal;
