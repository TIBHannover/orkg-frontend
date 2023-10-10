import Link from 'components/NextJsMigration/Link';
import { Row, Col } from 'reactstrap';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';

const TemplateCardStyled = styled.div`
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

const TemplateCard = ({ template }) => (
    <TemplateCardStyled className="list-group-item list-group-item-action">
        <Row>
            <Col sm={12}>
                {template && <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>}
                <br />
                <small>{template.id}</small>
            </Col>
        </Row>
    </TemplateCardStyled>
);

TemplateCard.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }).isRequired,
};

export default TemplateCard;
