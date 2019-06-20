import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const Check = styled.span`
    color: #329A0C;
    font-size:18px;
`;

const Cross = styled.span`
    color: #F02500;
    font-size:20px;
`;

class Boolean extends Component {
    constructor(props) {
        super(props);

        this.trueValues = ['t', 'y', 'true'];
        this.falseValues = ['f', 'n', 'false'];
        this.supportedValues = [...this.trueValues, ...this.falseValues];
    }

    render() {
        const label = this.props.children;

        if (!label) {
            return '';
        }

        // if label value is not supported, return the regular item
        if (this.supportedValues.indexOf(label.toLowerCase()) === -1) {
            return label;
        }

        if (this.trueValues.indexOf(label.toLowerCase()) !== -1) {
            return (
                <Check>
                    <Icon icon={faCheck} />
                </Check>
            );
        } else if (this.falseValues.indexOf(label.toLowerCase()) !== -1) {
            return (
                <Cross>
                    <Icon icon={faTimes} />
                </Cross>
            );
        } else {
            return label;
        }
    }
}

Boolean.propTypes = {
    children: PropTypes.string.isRequired,
};


export default Boolean;