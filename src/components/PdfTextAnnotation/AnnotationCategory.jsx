import { faExclamationTriangle, faPen, faQuestionCircle, faQuoteLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { filter, upperFirst } from 'lodash';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import tokenizer from 'sbd';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import useDeleteAnnotation from '@/components/PdfTextAnnotation/hooks/useDeleteAnnotation';
import useEditAnnotation from '@/components/PdfTextAnnotation/hooks/useEditAnnotation';
import Button from '@/components/Ui/Button/Button';

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

const updateHash = (highlight) => {
    if (!document?.location?.hash) {
        return;
    }
    document.location.hash = `annotation-${highlight.id}`;
};

const AnnotationCategory = (props) => {
    const { annotationClass } = props;
    const annotations = useSelector((state) => state.pdfTextAnnotation.annotations);
    const annotationsFiltered = filter(annotations, { type: annotationClass.iri });
    const amount = annotationsFiltered.length;
    const { deleteAnnotation } = useDeleteAnnotation();
    const { editModal, editAnnotation } = useEditAnnotation();
    const color = annotationClass.color ?? DEFAULT_HIGHLIGHT_COLOR;

    const handleEditClick = (e, id) => {
        e.stopPropagation();
        editAnnotation(id);
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        deleteAnnotation(id);
    };

    if (props.hideEmpty && amount === 0) {
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
                <Tooltip content="It is recommended to have maximum 3 annotated sentences per type">
                    <AnnotationAmount>
                        {amount > 3 ? <FontAwesomeIcon icon={faExclamationTriangle} /> : ''} {pluralize('annotation', amount, true)}
                    </AnnotationAmount>
                </Tooltip>
            </h2>
            {annotationsFiltered.map((annotation) => {
                const sentences = tokenizer.sentences(annotation.content.text);
                const sentenceAmount = sentences.length;
                const hasTooManySentences = sentenceAmount > MAX_SENTENCES_PER_ANNOTATION;

                return (
                    <AnnotationItem style={{ background: color }} onClick={() => updateHash(annotation)} key={annotation.id}>
                        {!hasTooManySentences ? (
                            <Quote icon={faQuoteLeft} />
                        ) : (
                            <Tooltip
                                content={`It looks like you selected ${sentenceAmount} sentences for this annotation. It is recommended to select maximum 2 sentences`}
                            >
                                <span>
                                    <SentenceWarning icon={faExclamationTriangle} />
                                </span>
                            </Tooltip>
                        )}

                        <div className="float-end">
                            <Tooltip content="Edit annotation text">
                                <span>
                                    <Button className="p-0 text-body" color="link" onClick={(e) => handleEditClick(e, annotation.id)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </Button>
                                </span>
                            </Tooltip>{' '}
                            <Tooltip content="Delete this annotation">
                                <span>
                                    <Button className="p-0 text-body" color="link" onClick={(e) => handleDeleteClick(e, annotation.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </span>
                            </Tooltip>
                        </div>
                        {annotation.content.text}
                    </AnnotationItem>
                );
            })}

            {editModal}
        </Container>
    );
};

AnnotationCategory.propTypes = {
    annotationClass: PropTypes.object.isRequired,
    hideEmpty: PropTypes.bool.isRequired,
};

export default AnnotationCategory;
