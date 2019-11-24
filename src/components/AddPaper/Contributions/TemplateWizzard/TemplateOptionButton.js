import React, { Component } from 'react';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

export const OptionButton = styled.div`
    margin: 0 2px;
    display: inline-block;
    & span {
        border-radius: 100%;
        text-align: center;
        display: inline-block;
        vertical-align: top;
        background-color: ${props => props.theme.ultraLightBlueDarker};
        cursor: pointer;
        color: ${props => props.theme.buttonDark};
        margin-right: 2px;
        .icon {
            padding: 0;
            margin: 0;
            font-size: 12px;
        }
    }
`;

class TemplateOptionButton extends Component {
    render() {
        return (
            <OptionButton onClick={this.props.action}>
                <Tippy content={this.props.title}>
                    <span
                        style={{
                            width: this.props.iconWrapperSize ? this.props.iconWrapperSize : '24px',
                            height: this.props.iconWrapperSize ? this.props.iconWrapperSize : '24px'
                        }}
                    >
                        <Icon className={'icon'} style={{ fontSize: this.props.iconSize ? this.props.iconSize : '12px' }} icon={this.props.icon} />
                    </span>
                </Tippy>
            </OptionButton>
        );
    }
}

TemplateOptionButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    iconWrapperSize: PropTypes.string,
    iconSize: PropTypes.string,
    action: PropTypes.func.isRequired
};

export default TemplateOptionButton;
