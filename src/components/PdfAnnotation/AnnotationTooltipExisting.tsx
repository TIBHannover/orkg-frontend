import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import styled from 'styled-components';

import useOntology, { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';

const Container = styled.div`
    background: #333333;
    padding: 10px 5px 10px 15px;
    border-radius: 6px;
    color: #fff;

    /* Ensure the tooltip can receive hover events to maintain popup visibility */
    pointer-events: auto;
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

type AnnotationTooltipExistingProps = {
    type?: string;
    id?: string;
    deleteAnnotation: (id: string) => void;
};

const AnnotationTooltipExisting = ({ type, id, deleteAnnotation }: AnnotationTooltipExistingProps) => {
    const { findByType } = useOntology();

    if (!type || !id) {
        return null;
    }

    if (type === SURVEY_TABLES_IRI || type === CSVW_TABLE_IRI) {
        return (
            <Container onClick={(e) => e.stopPropagation()}>
                <span className="pe-3">{type === SURVEY_TABLES_IRI ? 'Survey Table' : 'Regular Table'}</span>
                <IconWrapper>
                    <DeleteIcon icon={faTrash} onClick={() => deleteAnnotation(id ?? '')} />
                </IconWrapper>
            </Container>
        );
    }

    const label = upperFirst(findByType(type)?.label ?? '');

    return (
        <Container onClick={(e) => e.stopPropagation()}>
            <span className="pe-3">{label}</span>
            <IconWrapper>
                <DeleteIcon icon={faTrash} onClick={() => deleteAnnotation(id ?? '')} />
            </IconWrapper>
        </Container>
    );
};

export default AnnotationTooltipExisting;
