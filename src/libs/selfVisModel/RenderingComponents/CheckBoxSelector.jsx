import { Checkbox } from '@heroui/react';
import PropTypes from 'prop-types';
import { Component } from 'react';

class CheckboxSelector extends Component {
    constructor(props) {
        super(props);
        let isChecked = false;
        if (props.initializedValue) {
            isChecked = props.initializedValue.isSelectedColumn();
        }
        this.state = {
            isChecked,
        };
    }

    toggleCheckboxChange = (selected) => {
        const { handleCheckboxChange } = this.props;
        handleCheckboxChange(selected);
        this.setState({ isChecked: selected });
    };

    render() {
        const { isChecked } = this.state;
        const { cbx_id } = this.props;

        return (
            <Checkbox id={cbx_id} isSelected={isChecked} onChange={this.toggleCheckboxChange} aria-label="Toggle column selection">
                <Checkbox.Content>
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                </Checkbox.Content>
            </Checkbox>
        );
    }
}

CheckboxSelector.propTypes = {
    label: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    initializedValue: PropTypes.any,
    cbx_id: PropTypes.any,
};

export default CheckboxSelector;
