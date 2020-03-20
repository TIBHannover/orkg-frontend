import React, { Component } from 'react';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';

class StatementOptionButton extends Component {
    constructor(props) {
        super(props);

        this.yesButtonRef = React.createRef();
        this.cancelButtonRef = React.createRef();
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
            <span
                onClick={e => {
                    this.handleClick(e);
                }}
            >
                <Icon icon={this.props.icon} /> {this.props.buttonText}
            </span>
        );

        return (
            <span className={this.props.className}>
                {this.props.requireConfirmation ? (
                    <Tippy trigger={'mouseenter'} content={this.props.title} zIndex={999}>
                        <Tippy
                            onShow={this.onShow}
                            onShown={this.onShown}
                            onHide={this.onHide}
                            onCreate={this.onCreate}
                            interactive={true}
                            trigger={'click'}
                            content={
                                <div
                                    className={'text-center p-1'}
                                    style={{ color: '#fff', fontSize: '0.95rem', wordBreak: 'normal', cursor: 'default' }}
                                >
                                    <p className="mb-2">{this.props.confirmationMessage}</p>
                                    <ButtonGroup size="sm" className={'mt-1 mb-1'}>
                                        <Button
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.props.action();
                                                this.closeTippy();
                                            }}
                                            innerRef={this.yesButtonRef}
                                            className="px-2"
                                            color="danger"
                                            style={{ paddingTop: 2, paddingBottom: 2 }}
                                        >
                                            <Icon icon={faCheck} className={'mr-1'} /> Delete
                                        </Button>
                                        <Button
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.closeTippy();
                                            }}
                                            innerRef={this.cancelButtonRef}
                                            className="px-2"
                                            style={{ paddingTop: 2, paddingBottom: 2 }}
                                        >
                                            {' '}
                                            <Icon icon={faTimes} className={'mr-1'} /> Cancel
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            }
                        >
                            {tippyTarget}
                        </Tippy>
                    </Tippy>
                ) : (
                    <Tippy interactive={false} trigger={'mouseenter'} content={this.props.title}>
                        {tippyTarget}
                    </Tippy>
                )}
            </span>
        );
    }
}

StatementOptionButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    iconWrapperSize: PropTypes.string,
    iconSize: PropTypes.string,
    action: PropTypes.func.isRequired,
    requireConfirmation: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    buttonText: PropTypes.string,
    className: PropTypes.string,
    onVisibilityChange: PropTypes.func
};

StatementOptionButton.defaultProps = {
    requireConfirmation: false
};

export default StatementOptionButton;
