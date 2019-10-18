import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Boolean from './Boolean/Boolean';
import Link from './Link/Link';
import Latex from './Latex/Latex';

class ValuePlugins extends Component {

    render() {
        return (
            <Boolean>
                <Latex type={this.props.type}>
                    <Link type={this.props.type}>
                        {this.props.children}
                    </Link>
                </Latex>
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