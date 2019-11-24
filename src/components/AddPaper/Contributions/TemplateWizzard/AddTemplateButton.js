import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const AddTemplateStyle = styled.div`
    display: inline-block;
    margin-right: 8px;
    cursor: pointer;
    overflow: hidden;
    background-color: ${props => props.theme.ultraLightBlue};
    border-color: ${props => props.theme.darkblue};
    border: 1px solid ${props => props.theme.ultraLightBlueDarker};
    border-radius: 12px;
    .iconWrapper {
        display: inline-block;
        color: ${props => props.theme.darkblue};
        background-color: ${props => props.theme.ultraLightBlueDarker};
        padding: 2px 8px;
        font-size: smaller;
        line-height: 23px;
    }
    .labelWrapper {
        display: inline-block;
        background-color: ${props => props.theme.ultraLightBlue};
        padding: 2px 14px;
        font-size: smaller;
        line-height: 23px;
    }
    &:hover {
        border: 1px solid ${props => props.theme.ultraLightBlueDarker};
        .iconWrapper {
            color: #fff;
            background-color: ${props => props.theme.ultraLightBlueDarker};
        }
        .labelWrapper {
            color: #fff;
            background-color: ${props => props.theme.darkblue};
        }
    }
`;

class AddTemplateButton extends Component {
    render() {
        return (
            <AddTemplateStyle onClick={this.props.action}>
                <span className="iconWrapper">
                    <Icon size="xs" icon={faPlus} />
                </span>
                <span className="labelWrapper">{this.props.label}</span>
            </AddTemplateStyle>
        );
    }
}

AddTemplateButton.propTypes = {
    label: PropTypes.string.isRequired,
    action: PropTypes.func
};

AddTemplateButton.defaultProps = {
    label: ''
};

export default AddTemplateButton;
