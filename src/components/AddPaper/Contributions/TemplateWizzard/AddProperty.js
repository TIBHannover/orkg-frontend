import React, { Component } from 'react';
import { InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { StyledButton } from './../styled';
import PropTypes from 'prop-types';
import styled from 'styled-components';

class AddProperty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addProperty: false
        };
        this.inputRefs = React.createRef();
    }

    handleAddProperty = () => {
        this.setState({ addProperty: !this.state.addProperty });
    };

    render() {
        return <div>Test</div>;
    }
}

AddProperty.propTypes = {
    inTemplate: PropTypes.bool.isRequired
};

AddProperty.defaultProps = {
    inTemplate: false
};

export default AddProperty;
