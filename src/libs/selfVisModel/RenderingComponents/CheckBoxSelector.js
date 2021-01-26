import React, { Component } from 'react';
import { CustomInput } from 'reactstrap';
import PropTypes from 'prop-types';

class CheckboxSelector extends Component {
    constructor(props) {
        super(props);
        let isChecked = false;
        if (props.initializedValue) {
            isChecked = props.initializedValue.isSelectedColumn();
        }
        this.state = {
            isChecked: isChecked
        };
    }

    toggleCheckboxChange = () => {
        const { handleCheckboxChange } = this.props;
        handleCheckboxChange(!this.state.isChecked);
        this.setState(({ isChecked }) => ({
            isChecked: !isChecked
        }));
    };

    render() {
        const { isChecked } = this.state;

        return <CustomInput bsSize="xs" type="checkbox" id={this.props.cbx_id} onChange={this.toggleCheckboxChange} checked={isChecked} label="" />;
    }
}

CheckboxSelector.propTypes = {
    label: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    initializedValue: PropTypes.any,
    cbx_id: PropTypes.any
};

export default CheckboxSelector;
