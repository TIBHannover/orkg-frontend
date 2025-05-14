import { faMagic, faSpinner, faThList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toArray from 'lodash/toArray';
import randomcolor from 'randomcolor';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';

import AbstractAnnotatorView from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotatorView';
import AbstractInputView from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractInputView';
import AbstractRangesList from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractRangesList';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement, statementsUrl } from '@/services/backend/statements';
import { getLlmResponse, nlpServiceUrl } from '@/services/orkgNlp';
import { Range, RootStore } from '@/slices/types';
import { clearAnnotations, createAnnotation, setAbstract as setAbstractGlobal, setAbstractDialogView } from '@/slices/viewPaperSlice';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

const PREDICATE_OPTIONS = [
    {
        id: PREDICATES.HAS_RESEARCH_PROBLEM,
        service_id: 'RESEARCH_PROBLEM',
        label: 'Research Problem',
        description: 'The research problem that the work addresses',
        color: '#DAA520',
    },
    {
        id: PREDICATES.MATERIAL,
        service_id: 'MATERIAL',
        label: 'Material',
        description: 'The key resources utilized in a research contribution',
        color: '#D2B8E5',
    },
    {
        id: PREDICATES.METHOD,
        service_id: 'METHOD',
        label: 'Method',
        description: 'The method represents the approach, technique, or framework',
        color: '#7fa2ff',
    },
    {
        id: PREDICATES.RESULT,
        service_id: 'RESULT',
        label: 'Result',
        description: 'The result  represents the key findings from a research contribution',
        color: '#9df28a',
    },
];

type AbstractAnnotatorModalProps = {
    toggle: () => void;
    resourceId: string;
};

const AbstractAnnotatorModal: FC<AbstractAnnotatorModalProps> = ({ toggle, resourceId }) => {
    const { abstract: abstractGlobal, abstractDialogView, ranges, isAbstractLoading } = useSelector((state: RootStore) => state.viewPaper);
    const dispatch = useDispatch();

    const [validation, setValidation] = useState(true);

    const [predicateColors, setPredicateColors] = useState<Record<string, string>>(
        PREDICATE_OPTIONS.reduce((acc, p) => ({ ...acc, [p.id]: p.color }), {}),
    );

    const [abstract, setAbstract] = useState(abstractGlobal);

    const { isLoading: isAnnotationLoading, error: _annotationError } = useSWR(
        abstractGlobal
            ? [
                  {
                      taskName: LLM_TASK_NAMES.RECOMMEND_ANNOTATION,
                      placeholders: { text: abstractGlobal },
                  },
                  nlpServiceUrl,
                  'getLlmResponse',
              ]
            : null,
        ([params]) =>
            getLlmResponse(params).then((data) => {
                const annotated: string[] = [];
                const nRanges: Range[] = [];
                if (data && data.values) {
                    data.values.map((entity: { span: [number, number]; id: string; class: string }) => {
                        const text = abstractGlobal.substring(entity.span[0], entity.span[1] + 1);
                        if (annotated.indexOf(text.toLowerCase()) < 0) {
                            annotated.push(text.toLowerCase());
                            let rangePredicate: { id: string; label: string } | null = null;
                            if (PREDICATE_OPTIONS.filter((c) => c.service_id === entity.class).length > 0) {
                                [rangePredicate] = PREDICATE_OPTIONS.filter((c) => c.service_id === entity.class);
                                nRanges.push({
                                    id: entity.id,
                                    text,
                                    start: entity.span[0],
                                    end: entity.span[1],
                                    predicate: rangePredicate,
                                    isEditing: false,
                                });
                            }
                        }
                        return null;
                    });
                }
                // Clear annotations
                dispatch(clearAnnotations());
                nRanges.map((range) => dispatch(createAnnotation(range)));
                return nRanges;
            }),
    );

    const isAnnotationFailedLoading = _annotationError !== undefined;

    let annotationError = '';
    if (_annotationError) {
        if (_annotationError.statusCode === 422) {
            annotationError = 'Failed to annotate the abstract, please change the abstract and try again';
        } else {
            annotationError = '';
        }
    }

    const handleChangeAbstract = () => {
        if (abstractDialogView === 'input') {
            if (abstract.replace(/^\s+|\s+$/g, '') === '' || abstract.replace(/^\s+|\s+$/g, '').split(' ').length <= 1) {
                setValidation(false);
                return;
            }
        }
        dispatch(setAbstractGlobal(abstract));
        dispatch(setAbstractDialogView(abstractDialogView === 'input' ? 'annotator' : 'input'));
        setValidation(true);
    };

    const getPredicateColor = (rangePredicateId: string) => {
        if (!rangePredicateId) {
            return '#ffb7b7';
        }
        if (predicateColors[rangePredicateId]) {
            return predicateColors[rangePredicateId];
        }
        const newColor = randomcolor({ luminosity: 'light', seed: rangePredicateId.toLowerCase() });
        setPredicateColors({ ...predicateColors, [rangePredicateId]: newColor });
        return newColor;
    };

    const handleInsertData = async () => {
        const rangesArray = toArray(ranges);
        if (rangesArray.length > 0) {
            await Promise.all(
                rangesArray.map(async (range) => {
                    const object = await createResource({
                        label: range.text,
                        classes: range.predicate.id === PREDICATES.HAS_RESEARCH_PROBLEM ? [CLASSES.PROBLEM] : [],
                    });
                    // Add the statements to the selected contribution
                    return createResourceStatement(resourceId, range.predicate.id, object);
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

    const handleChangeView = (view: 'input' | 'annotator' | 'list') => {
        dispatch(setAbstractDialogView(view));
    };

    let currentStepDetails = (
        <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
            <AbstractAnnotatorView
                isAnnotationLoading={isAnnotationLoading}
                isAnnotationFailedLoading={isAnnotationFailedLoading}
                predicateOptions={PREDICATE_OPTIONS}
                annotationError={annotationError}
                getPredicateColor={getPredicateColor}
            />
        </AnimationContainer>
    );

    switch (abstractDialogView) {
        case 'input':
            currentStepDetails = (
                <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <AbstractInputView validation={validation} abstract={abstract} setAbstract={setAbstract} />
                </AnimationContainer>
            );
            break;
        case 'list':
            currentStepDetails = (
                <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <AbstractRangesList predicateOptions={PREDICATE_OPTIONS} getPredicateColor={getPredicateColor} />
                </AnimationContainer>
            );
            break;
        default:
            break;
    }

    return (
        <Modal isOpen toggle={toggle} size="xl">
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
                {abstractDialogView === 'list' && (
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
                )}
                {abstractDialogView !== 'list' && (
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
};

export default AbstractAnnotatorModal;
