import { faMagic, faSpinner, faThList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AbstractAnnotatorView from 'components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotatorView';
import AbstractInputView from 'components/ViewPaper/AbstractAnnotatorModal/AbstractInputView';
import AbstractRangesList from 'components/ViewPaper/AbstractAnnotatorModal/AbstractRangesList';
import toArray from 'lodash/toArray';
import PropTypes from 'prop-types';
import randomcolor from 'randomcolor';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getAnnotations } from 'services/annotation/index';
import { createResource } from 'services/backend/resources';
import { createResourceStatement, statementsUrl } from 'services/backend/statements';
import { clearAnnotations, createAnnotation, setAbstractDialogView, setAbstract as setAbstractGlobal } from 'slices/viewPaperSlice';
import styled from 'styled-components';
import { mutate } from 'swr';

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

function AbstractAnnotatorModal({ toggle, resourceId }) {
    const [isAbstractLoading, setIsAbstractLoading] = useState(false);
    const [isAbstractFailedLoading, setIsAbstractFailedLoading] = useState(false);
    const [isAnnotationLoading, setIsAnnotationLoading] = useState(false);
    const [isAnnotationFailedLoading, setIsAnnotationFailedLoading] = useState(false);
    const [annotationError, setAnnotationError] = useState(null);
    const [certaintyThreshold, setCertaintyThreshold] = useState([0.5]);
    const [validation, setValidation] = useState(true);
    const [classColors, setClassColors] = useState(CLASS_COLORS);

    const abstractGlobal = useSelector((state) => state.viewPaper.abstract);

    const [abstract, setAbstract] = useState(abstractGlobal);
    const dispatch = useDispatch();

    const abstractDialogView = useSelector((state) => state.viewPaper.abstractDialogView);
    const ranges = useSelector((state) => state.viewPaper.ranges);

    const getAnnotation = useCallback(() => {
        if (!abstract) {
            return Promise.resolve();
        }
        setIsAnnotationLoading(true);

        return getAnnotations(abstract)
            .then((data) => {
                const annotated = [];
                const nRanges = {};
                if (data && data.entities) {
                    data.entities
                        .map((entity) => {
                            const text = data.text.substring(entity[2][0][0], entity[2][0][1]);
                            if (annotated.indexOf(text.toLowerCase()) < 0) {
                                annotated.push(text.toLowerCase());
                                // Predicate label entity[1]
                                let rangeClass = CLASS_OPTIONS.filter((c) => c.label.toLowerCase() === entity[1].toLowerCase());
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
                        .filter((r) => r);
                }
                // Clear annotations
                dispatch(clearAnnotations());
                toArray(nRanges).map((range) => dispatch(createAnnotation(range)));
                setIsAnnotationLoading(false);
                setIsAnnotationFailedLoading(false);
                setIsAbstractLoading(false);
                setIsAbstractFailedLoading(false);
            })
            .catch((e) => {
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

    const getClassColor = (rangeClass) => {
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

    const handleInsertData = async () => {
        const rangesArray = toArray(ranges).filter((r) => r.certainty >= certaintyThreshold);
        if (rangesArray.length > 0) {
            await Promise.all(
                rangesArray.map(async (range) => {
                    const object = await createResource(range.text);
                    // Add the statements to the selected contribution
                    return createResourceStatement(resourceId, range.class.id, object.id);
                }),
            );
        }
        // revalidate the cache of the selected contribution
        mutate([
            {
                subjectId: resourceId,
                returnContent: true,
                returnFormattedLabels: true,
            },
            statementsUrl,
            'getStatements',
        ]);
        dispatch(clearAnnotations());
        toggle();
    };

    const handleChangeView = (view) => {
        dispatch(setAbstractDialogView(view));
    };

    let currentStepDetails = (
        <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
            <AbstractAnnotatorView
                certaintyThreshold={certaintyThreshold}
                isAbstractLoading={isAbstractLoading}
                isAnnotationLoading={isAnnotationLoading}
                isAnnotationFailedLoading={isAnnotationFailedLoading}
                handleChangeCertaintyThreshold={(v) => setCertaintyThreshold(v)}
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
                                <FontAwesomeIcon icon={faSpinner} spin />
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
                    <Button color="primary" className="float-end" onClick={handleChangeAbstract}>
                        Annotate Abstract
                    </Button>
                )}
                {abstractDialogView === 'list' ? (
                    <>
                        <Button color="secondary" outline className="float-start" onClick={() => handleChangeView('annotator')}>
                            <FontAwesomeIcon icon={faMagic} /> Annotator
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
                            <FontAwesomeIcon icon={faThList} /> List of annotations
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
    resourceId: PropTypes.string.isRequired,
};

export default AbstractAnnotatorModal;
