import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    background: #333333;
    padding: 10px 5px 10px 15px;
    border-radius: 6px;
    color: #fff;
`;

const IconWrapper = styled.span`
    border-left: 1px solid #707070;
    cursor: pointer;
    display: inline-block;
    padding: 0 10px;
`;

const DeleteIcon = styled(Icon)`
    color: #f87474;
`;

const AnnotationTooltipExisting = props => {
    const { findByType } = useOntology();

    const label = upperFirst(findByType(props.type).label);

    if (!props.type) {
        return;
    }

    return (
        <Container onClick={e => e.stopPropagation()}>
            <span className="pr-3">{label}</span>
            <IconWrapper>
                <DeleteIcon icon={faTrash} onClick={() => props.deleteAnnotation(props.id)} />
            </IconWrapper>
        </Container>
    );
};

AnnotationTooltipExisting.propTypes = {
    deleteAnnotation: PropTypes.func.isRequired,
    type: PropTypes.string,
    id: PropTypes.string
};

AnnotationTooltipExisting.defaultProps = {
    type: null,
    id: null
};

export default AnnotationTooltipExisting;
