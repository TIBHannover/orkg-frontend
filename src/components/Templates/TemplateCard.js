import { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
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

class TemplateCard extends Component {
    render() {
        return (
            <TemplateCardStyled className="list-group-item list-group-item-action">
                <Row>
                    <Col sm={12}>
                        {this.props.template && (
                            <Link to={reverse(ROUTES.TEMPLATE, { id: this.props.template.id })}>
                                {this.props.template.label ? this.props.template.label : <em>No title</em>}
                            </Link>
                        )}
                        <br />
                        <small>{this.props.template.id}</small>
                    </Col>
                </Row>
            </TemplateCardStyled>
        );
    }
}

TemplateCard.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    }).isRequired
};

export default TemplateCard;
