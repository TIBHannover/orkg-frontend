import React from 'react';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faQuoteLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import { Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { filter } from 'lodash';
import PropTypes from 'prop-types';
import { deleteAnnotation } from 'actions/pdfTextAnnotation';

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

const updateHash = highlight => {
    document.location.hash = `annotation-${highlight.id}`;
};

const AnnotationCategory = props => {
    const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';
    const { className } = props;
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const annotationsFiltered = filter(annotations, { type: className.iri });
    const amount = annotationsFiltered.length;
    const dispatch = useDispatch();

    if (props.hideEmpty && amount === 0) {
        return null;
    }

    const handleDelete = id => {
        if (window.confirm('Are you sure?')) {
            dispatch(deleteAnnotation(id));
        }
    };

    const color = className.color ?? DEFAULT_HIGHLIGHT_COLOR;

    return (
        <Container>
            <h2 className="h5 d-flex justify-content-between">
                <Tippy content={className.comment}>
                    <span>
                        {upperFirst(className.label)} <QuestionIcon icon={faQuestionCircle} />
                    </span>
                </Tippy>
                <AnnotationAmount>{amount}/3 annotations</AnnotationAmount>
            </h2>
            {annotationsFiltered.map(annotation => (
                <AnnotationItem style={{ background: color }} onClick={() => updateHash(annotation)}>
                    <Quote icon={faQuoteLeft} />
                    <div className="float-right">
                        <Tippy content="Delete this annotation">
                            <span>
                                <Button className="p-0 text-body" color="link" onClick={() => handleDelete(annotation.id)}>
                                    <Icon icon={faTrash} />
                                </Button>
                            </span>
                        </Tippy>
                    </div>
                    {annotation.content.text}
                </AnnotationItem>
            ))}
        </Container>
    );
};

AnnotationCategory.propTypes = {
    className: PropTypes.string.isRequired,
    hideEmpty: PropTypes.bool.isRequired
};

export default AnnotationCategory;
