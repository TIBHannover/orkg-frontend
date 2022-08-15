import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';

const DiagramCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

function DiagramCard({ diagram }) {
    return (
        <DiagramCardStyled className="list-group-item list-group-item-action">
            <Row>
                <Col sm={12}>
                    {diagram && <Link to={reverse(ROUTES.DIAGRAM, { id: diagram.id })}>{diagram.label ? diagram.label : <em>No title</em>}</Link>}
                    <br />
                    <small>{diagram.id}</small>
                </Col>
            </Row>
        </DiagramCardStyled>
    );
}

export default DiagramCard;

DiagramCard.propTypes = {
    diagram: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }).isRequired,
};
