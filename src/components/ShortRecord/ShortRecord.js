import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledShortRecord = styled.div`
    border: 1px solid #c8ccd1;
    margin-bottom: 2em;
    position: relative;
    width: 100%;
    .shortRecord-header {
        background-color: #eaecf0;
        position: relative;
        width: 100%;
    }
    .shortRecord-content {
        width: 100%;
        overflow-wrap: break-word;
    }
`;

class ShortRecord extends Component {
    render() {
        return (
            <StyledShortRecord>
                <div className="shortRecord-header">
                    <a href={this.props.href}>{this.props.header}</a>
                </div>
                <div className="shortRecord-content">{this.props.children}</div>
            </StyledShortRecord>
        );
    }
}

ShortRecord.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired
};

export default ShortRecord;
