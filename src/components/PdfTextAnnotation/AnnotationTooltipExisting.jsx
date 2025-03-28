import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import useOntology from '@/components/PdfTextAnnotation/hooks/useOntology';

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

const DeleteIcon = styled(FontAwesomeIcon)`
    color: #f87474;
`;

const AnnotationTooltipExisting = ({ type = null, id = null, deleteAnnotation }) => {
    const { findByType } = useOntology();

    const label = upperFirst(findByType(type).label);

    if (!type) {
        return;
    }

    return (
        <Container onClick={(e) => e.stopPropagation()}>
            <span className="pe-3">{label}</span>
            <IconWrapper>
                <DeleteIcon icon={faTrash} onClick={() => deleteAnnotation(id)} />
            </IconWrapper>
        </Container>
    );
};

AnnotationTooltipExisting.propTypes = {
    deleteAnnotation: PropTypes.func.isRequired,
    type: PropTypes.string,
    id: PropTypes.string,
};

export default AnnotationTooltipExisting;
