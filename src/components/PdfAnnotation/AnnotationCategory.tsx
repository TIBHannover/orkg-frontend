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
import { Tooltip } from '@heroui/react';
import { filter, upperFirst } from 'lodash';
import pluralize from 'pluralize';
import { FC } from 'react';
import { IHighlight } from 'react-pdf-highlighter';
import { useDispatch, useSelector } from 'react-redux';
import tokenizer from 'sbd';

import ActionButton from '@/components/ActionButton/ActionButton';
import ExtractionModal from '@/components/PdfAnnotation/ExtractionModal';
import useEditAnnotation from '@/components/PdfAnnotation/hooks/useEditAnnotation';
import { CSVW_TABLE_IRI, OntologyClass, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import { deleteAnnotation as deleteAnnotationAction, updateAnnotationIsExtractionModalOpen } from '@/slices/pdfAnnotationSlice';
import { Annotation, RootStore } from '@/slices/types';

const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';
const MAX_SENTENCES_PER_ANNOTATION = 2;

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

    const isTableCategory = annotationClass.iri === SURVEY_TABLES_IRI || annotationClass.iri === CSVW_TABLE_IRI;
    const showAmountTooltip = !isTableCategory;

    return (
        <div className="w-full">
            <h2 className="text-xl flex justify-between mb-1">
                <Tooltip>
                    <Tooltip.Trigger className="inline-flex items-center gap-2">
                        <span>
                            {upperFirst(annotationClass.label)} <FontAwesomeIcon icon={faQuestionCircle} className="text-[15px] opacity-60" />
                        </span>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-[300px]">{annotationClass.comment}</Tooltip.Content>
                </Tooltip>
                {showAmountTooltip ? (
                    <Tooltip>
                        <Tooltip.Trigger className="inline-flex">
                            <span className="text-[15px]">
                                {amount > 3 && <FontAwesomeIcon icon={faExclamationTriangle} />} {pluralize('annotation', amount, true)}
                            </span>
                        </Tooltip.Trigger>
                        <Tooltip.Content>It is recommended to have maximum 3 annotated sentences per type</Tooltip.Content>
                    </Tooltip>
                ) : (
                    <span className="text-[15px]">{pluralize('annotation', amount, true)}</span>
                )}
            </h2>
            {annotationsFiltered.map((annotation, index) => {
                const sentences = tokenizer.sentences(annotation.content?.text ?? '');
                const sentenceAmount = sentences.length;
                const hasTooManySentences = sentenceAmount > MAX_SENTENCES_PER_ANNOTATION;
                const isTable = annotationClass.iri === SURVEY_TABLES_IRI || annotationClass.iri === CSVW_TABLE_IRI;
                const icon = isTable ? faTable : faQuoteLeft;
                const leadIcon = !hasTooManySentences ? (
                    <FontAwesomeIcon icon={icon} className="text-[28px] opacity-60 shrink-0" />
                ) : (
                    <Tooltip>
                        <Tooltip.Trigger className="inline-flex shrink-0">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-[28px] animate-[blinkAnimation_1s_linear_5]" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            It looks like you selected {sentenceAmount} sentences for this annotation. It is recommended to select maximum 2 sentences
                        </Tooltip.Content>
                    </Tooltip>
                );

                const actionButtons = isTable && (
                    <div className="flex items-center gap-1 shrink-0">
                        {annotation.view !== 'done' && (
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
                        {annotation.view === 'done' && (
                            <ActionButton
                                title={`View imported ${annotation.type === SURVEY_TABLES_IRI ? 'papers' : 'table'}`}
                                icon={faCheckCircle}
                                action={() => handleEditClick(annotation.id)}
                            />
                        )}
                    </div>
                );

                return (
                    <div
                        className="rounded-md py-2 px-3 text-[90%] mb-1.5 cursor-pointer flex items-center gap-2"
                        style={{ background: color }}
                        onClick={() => updateHash(annotation)}
                        key={annotation.id}
                        role="presentation"
                    >
                        {leadIcon}
                        <div className="flex-1 min-w-0">
                            {isTable ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={annotation.content?.image ?? ''}
                                    alt={`Table preview ${index + 1}`}
                                    className="max-w-[200px] max-h-[150px] overflow-auto object-contain"
                                />
                            ) : (
                                <span className="break-words">{annotation.content?.text}</span>
                            )}
                        </div>
                        {actionButtons}
                        {annotation.isExtractionModalOpen && <ExtractionModal id={annotation.id} />}
                    </div>
                );
            })}
            {editModal}
        </div>
    );
};

export default AnnotationCategory;
