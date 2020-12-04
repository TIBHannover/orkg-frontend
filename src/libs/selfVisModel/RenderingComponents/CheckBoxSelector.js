import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { CustomInput, FormGroup } from 'reactstrap';

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

        return (
            <div className="checkbox" style={{ marginLeft: '5px', paddingTop: '3px' }}>
                <FormGroup style={{ fontSize: '90%' }}>
                    <CustomInput
                        style={{ marginRight: '-1px' }}
                        type="checkbox"
                        id={this.props.cbx_id}
                        onChange={this.toggleCheckboxChange}
                        checked={isChecked}
                        label=""
                    />
                </FormGroup>
            </div>
        );
    }
}

CheckboxSelector.propTypes = {
    label: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    initializedValue: PropTypes.any,
    cbx_id: PropTypes.any
};

export default CheckboxSelector;
