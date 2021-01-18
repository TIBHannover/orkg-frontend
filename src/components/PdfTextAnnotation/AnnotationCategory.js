import styled from 'styled-components';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faQuoteLeft, faTrash, faExclamationTriangle, faPen } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { filter } from 'lodash';
import PropTypes from 'prop-types';
import useDeleteAnnotation from 'components/PdfTextAnnotation/hooks/useDeleteAnnotation';
import useEditAnnotation from 'components/PdfTextAnnotation/hooks/useEditAnnotation';
import tokenizer from 'sbd';

const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';
const MAX_SENTENCES_PER_ANNOTATION = 2;

const Container = styled.div`
    width: 100%;
    margin-top: 20px;
`;

const QuestionIcon = styled(Icon)`
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

const Quote = styled(Icon)`
    opacity: 0.6;
    font-size: 28px;
    padding-right: 6px;
`;

const SentenceWarning = styled(Icon)`
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

const updateHash = highlight => {
    document.location.hash = `annotation-${highlight.id}`;
};

const AnnotationCategory = props => {
    const { annotationClass } = props;
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
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
                <Tippy content={annotationClass.comment}>
                    <span>
                        {upperFirst(annotationClass.label)} <QuestionIcon icon={faQuestionCircle} />
                    </span>
                </Tippy>
                <Tippy content="It is recommended to have maximum 3 annotated sentences per type">
                    <AnnotationAmount>
                        {amount > 3 ? <Icon icon={faExclamationTriangle} /> : ''} {amount} annotation{amount !== 1 ? 's' : ''}
                    </AnnotationAmount>
                </Tippy>
            </h2>
            {annotationsFiltered.map(annotation => {
                const sentences = tokenizer.sentences(annotation.content.text);
                const sentenceAmount = sentences.length;
                const hasTooManySentences = sentenceAmount > MAX_SENTENCES_PER_ANNOTATION;

                return (
                    <AnnotationItem style={{ background: color }} onClick={() => updateHash(annotation)} key={annotation.id}>
                        {!hasTooManySentences ? (
                            <Quote icon={faQuoteLeft} />
                        ) : (
                            <Tippy
                                content={`It looks like you selected ${sentenceAmount} sentences for this annotation. It is recommended to select maximum 2 sentences`}
                            >
                                <span>
                                    <SentenceWarning icon={faExclamationTriangle} />
                                </span>
                            </Tippy>
                        )}

                        <div className="float-right">
                            <Tippy content="Edit annotation text">
                                <span>
                                    <Button className="p-0 text-body" color="link" onClick={e => handleEditClick(e, annotation.id)}>
                                        <Icon icon={faPen} />
                                    </Button>
                                </span>
                            </Tippy>{' '}
                            <Tippy content="Delete this annotation">
                                <span>
                                    <Button className="p-0 text-body" color="link" onClick={e => handleDeleteClick(e, annotation.id)}>
                                        <Icon icon={faTrash} />
                                    </Button>
                                </span>
                            </Tippy>
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
    hideEmpty: PropTypes.bool.isRequired
};

export default AnnotationCategory;
