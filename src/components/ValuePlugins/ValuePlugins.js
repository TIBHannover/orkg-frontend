import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Boolean from './Boolean/Boolean';
import Link from './Link/Link';

class ValuePlugins extends Component {

    render() {
        return (
            <Boolean>
                <Link type={this.props.type}>
                    {this.props.children}
                </Link>
            </Boolean>
        );
    }
}

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
};


export default ValuePlugins;