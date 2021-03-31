import { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledShortRecord = styled.div`
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

class ShortRecord extends Component {
    render() {
        return (
            <StyledShortRecord className="list-group-item list-group-item-action">
                <Row>
                    <Col sm={12}>
                        <Link to={this.props.href}>{this.props.header}</Link>
                        <br />
                        <small>{this.props.children}</small>
                    </Col>
                </Row>
            </StyledShortRecord>
        );
    }
}

ShortRecord.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    header: PropTypes.string.isRequired
};

export default ShortRecord;
