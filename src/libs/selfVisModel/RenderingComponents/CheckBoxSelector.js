import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

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
        const { label } = this.props;
        const { isChecked } = this.state;

        return (
            <div className="checkbox">
                <label>
                    <input type="checkbox" value={label} checked={isChecked} onChange={this.toggleCheckboxChange} />

                    {label}
                </label>
            </div>
        );
    }
}

CheckboxSelector.propTypes = {
    label: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    initializedValue: PropTypes.any
};

export default CheckboxSelector;
