import {
    faCheck,
    faCheckCircle,
    faExclamationTriangle,
    faPen,
    faQuestionCircle,
    faQuoteLeft,
    faTable,
    faTimes,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { filter, upperFirst } from 'lodash';
import pluralize from 'pluralize';
import { FC } from 'react';
import { IHighlight } from 'react-pdf-highlighter';
import { useDispatch, useSelector } from 'react-redux';
import tokenizer from 'sbd';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ExtractionModal from '@/components/PdfAnnotation/ExtractionModal';
import useEditAnnotation from '@/components/PdfAnnotation/hooks/useEditAnnotation';
import { CSVW_TABLE_IRI, OntologyClass, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import { deleteAnnotation as deleteAnnotationAction, updateAnnotationIsExtractionModalOpen } from '@/slices/pdfAnnotationSlice';
import { Annotation, RootStore } from '@/slices/types';

const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';
const MAX_SENTENCES_PER_ANNOTATION = 2;

const Container = styled.div`
    width: 100%;
    margin-top: 20px;
`;

const QuestionIcon = styled(FontAwesomeIcon)`
    opacity: 0.6;
    font-size: 15px;
`;

const AnnotationAmount = styled.div`
    font-size: 15px;
`;

const AnnotationItem = styled.div`
    background: #ffe28f;
    border-radius: 6px;
    padding: 10px 15px;
    font-size: 90%;
    margin-bottom: 10px;
    cursor: pointer;
`;

const Quote = styled(FontAwesomeIcon)`
    opacity: 0.6;
    font-size: 28px;
    padding-right: 6px;
`;

const SentenceWarning = styled(FontAwesomeIcon)`
    font-size: 28px;
    padding-right: 6px;
    animation: blink 1s linear;
    animation-iteration-count: 5;

    @keyframes blink {
        50% {
            opacity: 0;
        }
    }
`;

const updateHash = (highlight: IHighlight) => {
    document.location.hash = `annotation-${highlight.id}`;
};

type AnnotationCategoryProps = {
    annotationClass: OntologyClass;
    hideEmpty: boolean;
};

const AnnotationCategory: FC<AnnotationCategoryProps> = ({ annotationClass, hideEmpty }) => {
    const annotations = useSelector((state: RootStore) => state.pdfAnnotation.annotations);
    const annotationsFiltered = filter(annotations, { type: annotationClass.iri }) as Annotation[];
    const amount = annotationsFiltered.length;

    const { editModal, editAnnotation } = useEditAnnotation();
    const color = annotationClass.color ?? DEFAULT_HIGHLIGHT_COLOR;
    const dispatch = useDispatch();

    const handleEditClick = (id: string) => {
        if (annotationClass.iri === SURVEY_TABLES_IRI || annotationClass.iri === CSVW_TABLE_IRI) {
            dispatch(updateAnnotationIsExtractionModalOpen({ id, isExtractionModalOpen: true }));
        } else {
            editAnnotation(id);
        }
    };

    const handleDeleteClick = (id: string) => {
        dispatch(deleteAnnotationAction(id));
    };

    if (hideEmpty && amount === 0) {
        return null;
    }

    return (
        <Container>
            <h2 className="h5 d-flex justify-content-between">
                <Tooltip content={annotationClass.comment} contentStyle={{ maxWidth: '300px' }}>
                    <span>
                        {upperFirst(annotationClass.label)} <QuestionIcon icon={faQuestionCircle} />
                    </span>
                </Tooltip>
                <Tooltip
                    content="It is recommended to have maximum 3 annotated sentences per type"
                    disabled={annotationClass.iri === SURVEY_TABLES_IRI || annotationClass.iri === CSVW_TABLE_IRI}
                >
                    <AnnotationAmount>
                        {amount > 3 && annotationClass.iri !== SURVEY_TABLES_IRI && annotationClass.iri !== CSVW_TABLE_IRI ? (
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        ) : (
                            ''
                        )}{' '}
                        {pluralize('annotation', amount, true)}
                    </AnnotationAmount>
                </Tooltip>
            </h2>
            {annotationsFiltered.map((annotation, index) => {
                const sentences = tokenizer.sentences(annotation.content?.text ?? '');
                const sentenceAmount = sentences.length;
                const hasTooManySentences = sentenceAmount > MAX_SENTENCES_PER_ANNOTATION;
                const isTable = annotationClass.iri === SURVEY_TABLES_IRI || annotationClass.iri === CSVW_TABLE_IRI;
                const icon = isTable ? faTable : faQuoteLeft;
                return (
                    <AnnotationItem style={{ background: color }} onClick={() => updateHash(annotation)} key={annotation.id}>
                        {!hasTooManySentences ? (
                            <Quote icon={icon} />
                        ) : (
                            <Tooltip
                                content={
                                    <>
                                        It looks like you selected {sentenceAmount} sentences for this annotation. It is recommended to select maximum
                                        2 sentences
                                    </>
                                }
                            >
                                <span>
                                    <SentenceWarning icon={faExclamationTriangle} />
                                </span>
                            </Tooltip>
                        )}

                        <div className="float-end">
                            {isTable && annotation.view !== 'done' && (
                                <>
                                    <ActionButton
                                        title={`Edit annotation ${isTable ? 'table' : 'text'}`}
                                        icon={faPen}
                                        action={() => handleEditClick(annotation.id)}
                                    />

                                    <ActionButton
                                        title="Remove annotation"
                                        icon={faTrash}
                                        requireConfirmation
                                        confirmationMessage="Are you sure?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: async () => {
                                                    await handleDeleteClick(annotation.id);
                                                },
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                    />
                                </>
                            )}
                            {isTable && annotation.view === 'done' && (
                                <ActionButton
                                    title={`View imported ${annotation.type === SURVEY_TABLES_IRI ? 'papers' : 'table'}`}
                                    icon={faCheckCircle}
                                    action={() => handleEditClick(annotation.id)}
                                />
                            )}
                        </div>
                        {isTable ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={annotation.content?.image ?? ''}
                                alt={`Table preview ${index + 1}`}
                                className="tw:max-w-[200px] tw:max-h-[150px] tw:overflow-auto tw:object-contain"
                            />
                        ) : (
                            annotation.content?.text
                        )}
                        {annotation.isExtractionModalOpen && <ExtractionModal id={annotation.id} />}
                    </AnnotationItem>
                );
            })}

            {editModal}
        </Container>
    );
};

export default AnnotationCategory;
