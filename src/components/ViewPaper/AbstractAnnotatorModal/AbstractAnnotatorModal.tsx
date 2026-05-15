import { faMagic, faSpinner, faThList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import toArray from 'lodash/toArray';
import randomcolor from 'randomcolor';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const PREDICATE_COLOR_BY_ID: Record<string, string> = PREDICATE_OPTIONS.reduce(
    (acc, p) => ({ ...acc, [p.id]: p.color }),
    {} as Record<string, string>,
);

type AbstractAnnotatorModalProps = {
    toggle: () => void;
    resourceId: string;
};

const AbstractAnnotatorModal: FC<AbstractAnnotatorModalProps> = ({ toggle, resourceId }) => {
    const { abstract: abstractGlobal, abstractDialogView, ranges, isAbstractLoading } = useSelector((state: RootStore) => state.viewPaper);
    const dispatch = useDispatch();

    const [validation, setValidation] = useState(true);
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
                dispatch(clearAnnotations());
                nRanges.map((range) => dispatch(createAnnotation(range)));
                return nRanges;
            }),
    );

    const isAnnotationFailedLoading = _annotationError !== undefined;

    let annotationError = '';
    if (_annotationError && _annotationError.statusCode === 422) {
        annotationError = 'Failed to annotate the abstract, please change the abstract and try again';
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
        const known = PREDICATE_COLOR_BY_ID[rangePredicateId];
        if (known) {
            return known;
        }
        return randomcolor({ luminosity: 'light', seed: rangePredicateId.toLowerCase() });
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
                    return createResourceStatement(resourceId, range.predicate.id, object);
                }),
            );
        }
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
        <motion.div key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <AbstractAnnotatorView
                isAnnotationLoading={isAnnotationLoading}
                isAnnotationFailedLoading={isAnnotationFailedLoading}
                predicateOptions={PREDICATE_OPTIONS}
                annotationError={annotationError}
                getPredicateColor={getPredicateColor}
            />
        </motion.div>
    );

    switch (abstractDialogView) {
        case 'input':
            currentStepDetails = (
                <motion.div key={2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                    <AbstractInputView validation={validation} abstract={abstract} setAbstract={setAbstract} />
                </motion.div>
            );
            break;
        case 'list':
            currentStepDetails = (
                <motion.div key={3} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                    <AbstractRangesList predicateOptions={PREDICATE_OPTIONS} getPredicateColor={getPredicateColor} />
                </motion.div>
            );
            break;
        default:
            break;
    }

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-5xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Abstract annotator</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        {(isAbstractLoading || isAnnotationLoading) && (
                            <div className="text-center text-accent">
                                <FontAwesomeIcon icon={faSpinner} spin className="text-6xl" />
                                <h2 className="text-xl mt-3">{isAbstractLoading ? 'Loading abstract...' : 'Loading annotations...'}</h2>
                            </div>
                        )}
                        <AnimatePresence mode="wait">{currentStepDetails}</AnimatePresence>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex w-full items-center justify-between gap-2">
                            {abstractDialogView === 'list' ? (
                                <Button variant="outline" className="button--orkg-secondary" onPress={() => handleChangeView('annotator')}>
                                    <FontAwesomeIcon icon={faMagic} className="mr-1 text-white" /> Annotator
                                </Button>
                            ) : (
                                <Button variant="outline" className="button--orkg-secondary" onPress={() => handleChangeView('list')}>
                                    <FontAwesomeIcon icon={faThList} className="mr-1 text-white" /> List of annotations
                                </Button>
                            )}
                            <div className="flex gap-2">
                                {abstractDialogView === 'input' ? (
                                    <Button variant="primary" onPress={handleChangeAbstract}>
                                        Annotate abstract
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" onPress={handleChangeAbstract}>
                                            Change abstract
                                        </Button>
                                        <Button className="button--orkg-smart" onPress={handleInsertData}>
                                            Insert data
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AbstractAnnotatorModal;
