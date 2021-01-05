import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';
import { withCookies, Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

class Pulse extends Component {
    constructor(props) {
        super(props);

        this.state = {
            active: true
        };
    }

    onCreate = tippy => {
        this.tippy = tippy;
    };

    handleClick = e => {
        this.tippy.disable();
        this.setState({ active: false });
        this.props.cookies.set('showedValueHelp', true, { path: env('PUBLIC_URL'), maxAge: 604800 });
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    render() {
        return (
            <Tippy
                onCreate={this.onCreate}
                onShow={() => (this.state.active ? true : false)}
                arrow={false}
                content={<div style={{ position: 'relative', display: 'inline-block' }}>{this.props.content}</div>}
            >
                <span
                    onClick={this.handleClick}
                    style={{ position: 'relative' }}
                    onKeyDown={e => (e.keyCode === 13 ? this.handleClick : undefined)}
                    role="button"
                    tabIndex={0}
                >
                    <span className={this.state.active ? 'pulsate-css' : undefined} />
                    {this.props.children}
                </span>
            </Tippy>
        );
    }
}

Pulse.propTypes = {
    content: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func,
    cookies: PropTypes.instanceOf(Cookies).isRequired
};

export default withCookies(Pulse);
