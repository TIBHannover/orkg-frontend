import { createRef, Component } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';

export const OptionButton = styled(Button)`
    margin: 0 2px !important;
    display: inline-block !important;
    border-radius: 100% !important;
    background-color: ${props => props.theme.lightDarker}!important;
    color: ${props => props.theme.buttonDark}!important;

    & .icon-wrapper {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        .icon {
            padding: 0;
            margin: 0;
            font-size: 12px;
        }
    }

    :focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5) !important;
    }
`;
class StatementOptionButton extends Component {
    constructor(props) {
        super(props);

        this.yesButtonRef = createRef();
        this.cancelButtonRef = createRef();
    }

    onShow = () => {
        document.addEventListener('keydown', this.onKeyPressed);

        if (this.props.onVisibilityChange) {
            this.props.onVisibilityChange(true);
        }
    };

    onShown = () => {
        this.yesButtonRef.current.focus();
    };

    onHide = () => {
        document.removeEventListener('keydown', this.onKeyPressed);

        if (this.props.onVisibilityChange) {
            this.props.onVisibilityChange(false);
        }
    };

    onKeyPressed = e => {
        if (e.keyCode === 27) {
            // escape
            this.tippy.hide();
        }
        if (e.keyCode === 9) {
            // Tab
            e.preventDefault();
            e.stopPropagation();
            if (document.activeElement === this.yesButtonRef.current) {
                this.cancelButtonRef.current.focus();
            } else {
                this.yesButtonRef.current.focus();
            }
        }
    };

    onCreate = tippy => {
        this.tippy = tippy;
    };

    closeTippy = () => {
        this.tippy.hide();
    };

    handleClick = e => {
        e.stopPropagation();
        if (!this.props.requireConfirmation) {
            this.props.action();
        }
    };

    render() {
        const tippyTarget = (
            <span>
                <OptionButton disabled={this.props.isDisabled} color="link" className="p-0" onClick={this.handleClick} aria-label={this.props.title}>
                    <span
                        className="icon-wrapper"
                        style={{
                            width: this.props.iconWrapperSize ? this.props.iconWrapperSize : '24px',
                            height: this.props.iconWrapperSize ? this.props.iconWrapperSize : '24px'
                        }}
                    >
                        <Icon
                            className="icon"
                            style={{
                                fontSize: this.props.iconSize ? this.props.iconSize : '12px'
                            }}
                            icon={this.props.icon}
                        />
                    </span>
                </OptionButton>
            </span>
        );

        return this.props.requireConfirmation && !this.props.isDisabled ? (
            <Tippy trigger="mouseenter" content={this.props.title} zIndex={999}>
                <Tippy
                    onShow={this.onShow}
                    onShown={this.onShown}
                    onHide={this.onHide}
                    onCreate={this.onCreate}
                    interactive={true}
                    appendTo={this.props.appendTo}
                    trigger="click"
                    content={
                        <div className="text-center p-1" style={{ color: '#fff', fontSize: '0.95rem', wordBreak: 'normal' }}>
                            <p className="mb-2">{this.props.confirmationMessage}</p>
                            <ButtonGroup size="sm" className="mt-1 mb-1">
                                <Button
                                    onClick={() => {
                                        this.props.action();
                                        this.closeTippy();
                                    }}
                                    innerRef={this.yesButtonRef}
                                    className="px-2"
                                    color="danger"
                                    style={{ paddingTop: 2, paddingBottom: 2 }}
                                >
                                    <Icon icon={faCheck} className="mr-1" />
                                    Delete
                                </Button>
                                <Button
                                    onClick={() => {
                                        this.closeTippy();
                                    }}
                                    innerRef={this.cancelButtonRef}
                                    className="px-2"
                                    style={{ paddingTop: 2, paddingBottom: 2 }}
                                >
                                    {' '}
                                    <Icon icon={faTimes} className="mr-1" /> Cancel
                                </Button>
                            </ButtonGroup>
                        </div>
                    }
                >
                    {tippyTarget}
                </Tippy>
            </Tippy>
        ) : (
            <Tippy hideOnClick={false} interactive={false} trigger="mouseenter" content={this.props.title}>
                {tippyTarget}
            </Tippy>
        );
    }
}

StatementOptionButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    iconWrapperSize: PropTypes.string,
    iconSize: PropTypes.string,
    action: PropTypes.func,
    requireConfirmation: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    onVisibilityChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

StatementOptionButton.defaultProps = {
    requireConfirmation: false,
    appendTo: 'parent',
    action: () => {}
};

export default StatementOptionButton;
