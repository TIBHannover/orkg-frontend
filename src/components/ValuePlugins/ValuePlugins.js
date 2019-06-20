import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Boolean from './Boolean/Boolean';

class ValuePlugins extends Component {

    render() {
        return <Boolean>{this.props.children}</Boolean>
    }
}

ValuePlugins.propTypes = {
    children: PropTypes.string.isRequired,
};


export default ValuePlugins;