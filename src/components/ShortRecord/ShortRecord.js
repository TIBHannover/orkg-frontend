import Link from 'components/NextJsMigration/Link';
import { Component } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledShortRecord = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${(props) => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

class ShortRecord extends Component {
    render() {
        return (
            <StyledShortRecord className="list-group-item px-4 py-3">
                <Row>
                    <Col sm={12}>
                        <Link href={this.props.href}>{this.props.header ? this.props.header : <i>No label</i>}</Link>
                        <br />
                        <small>{this.props.children}</small>
                    </Col>
                </Row>
            </StyledShortRecord>
        );
    }
}

ShortRecord.propTypes = {
    /** Link of the header label */
    href: PropTypes.string.isRequired,
    /** Content displayed under header label */
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.node]),
    /** Header label */
    header: PropTypes.string.isRequired,
};

export default ShortRecord;
