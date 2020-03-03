import React, { Component } from 'react';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';

class StatementOptionButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmation: false
        };

        this.yesButtonRef = React.createRef();
        this.cancelButtonRef = React.createRef();
    }

    onShow = () => {
        if (this.props.requireConfirmation) {
            document.addEventListener('keydown', this.onKeyPressed);
        }
    };

    onShown = () => {
        if (this.props.requireConfirmation) {
            this.yesButtonRef.current.focus();
        }
    };

    onHide = () => {
        if (this.props.requireConfirmation) {
            document.removeEventListener('keydown', this.onKeyPressed);
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
        } else {
            // We need to manually update the tooltip's position.
            this.setState({ showConfirmation: true }, () => {
                this.tippy.popperInstance.update();
            });
        }
    };
    render() {
        const content =
            !this.props.requireConfirmation && !this.state.showConfirmation ? (
                this.props.title
            ) : (
                <span>
                    <div className={'text-center'} style={{ color: '#fff' }}>
                        {this.props.confirmationMessage}
                        <br />
                        <ButtonGroup size="sm" className={'mt-1 mb-1'}>
                            <Button
                                onClick={() => {
                                    this.props.action();
                                    this.closeTippy();
                                }}
                                innerRef={this.yesButtonRef}
                            >
                                <Icon icon={faCheck} className={'mr-1'} />
                                Yes
                            </Button>
                            <Button
                                onClick={() => {
                                    this.closeTippy();
                                    this.setState({ showConfirmation: false });
                                }}
                                innerRef={this.cancelButtonRef}
                            >
                                {' '}
                                <Icon icon={faTimes} className={'mr-1'} /> Cancel
                            </Button>
                        </ButtonGroup>
                    </div>
                </span>
            );

        return (
            <span className={this.props.className}>
                <Tippy
                    onShow={this.onShow}
                    onShown={this.onShown}
                    onHide={this.onHide}
                    onCreate={this.onCreate}
                    interactive={this.props.requireConfirmation ? true : false}
                    trigger={this.props.requireConfirmation ? 'click' : 'mouseenter'}
                    content={content}
                >
                    <span
                        onClick={e => {
                            e.stopPropagation();
                            this.handleClick(e);
                        }}
                    >
                        <Icon icon={this.props.icon} /> {this.props.buttonText}
                    </span>
                </Tippy>
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
    className: PropTypes.string
};

StatementOptionButton.defaultProps = {
    requireConfirmation: false
};

export default StatementOptionButton;
