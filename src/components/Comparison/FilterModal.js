import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import CategoricalFilterRule from './CategoricalFilterRule.js';
import OrdinalFilterRule from './OrdinalFilterRule.js';
import TextFilterRule from './TextFilterRule.js';

function FilterModal(props) {
    //text and min dont need values
    const DATE_FORMAT = /\d{4}-[01]\d-([012]\d|30|31)/;
    const { data, updateRules, showFilterDialog, toggleFilteDialog } = props;
    const { property, values, rules } = data;
    const { label: propertyName } = property;

    const isCateg = () => {
        return Object.keys(values).length > 1;
    };
    const isNum = () => {
        return Object.keys(values).length === Object.keys(values).filter(value => !isNaN(value) && !isNaN(parseFloat(value))).length;
    };
    const isDate = () => {
        return Object.keys(values).length === Object.keys(values).filter(value => value.match(DATE_FORMAT)).length;
    };
    const isText = () => {
        return (
            Object.keys(values).length > 3 && Object.keys(values).length !== Object.keys(values).filter(value => value.split(' ').length < 6).length
        );
    };

    const generateCatFilter = () => <CategoricalFilterRule controldata={{ property, values, rules, updateRules }} />;

    const generateOrdFilter = typeIsDate => <OrdinalFilterRule controldata={{ property, rules, updateRules, typeIsDate: typeIsDate, DATE_FORMAT }} />;

    const generateTextFilter = () => <TextFilterRule controldata={{ property, values, rules, updateRules }} />;

    const generateFilter = () => {
        if (isNum()) {
            return generateOrdFilter(false);
        } else if (isDate()) {
            return generateOrdFilter(true);
        } else if (isText()) {
            return generateTextFilter();
        } else if (isCateg()) {
            return generateCatFilter();
        }
        return <></>;
    };

    return (
        <Modal isOpen={showFilterDialog} toggle={toggleFilteDialog}>
            <ModalHeader className="text-capitalize" toggle={toggleFilteDialog}>
                {propertyName}
            </ModalHeader>
            <ModalBody>{generateFilter()}</ModalBody>
        </Modal>
    );
}

FilterModal.propTypes = {
    data: PropTypes.object.isRequired,
    updateRules: PropTypes.func.isRequired,
    showFilterDialog: PropTypes.bool.isRequired,
    toggleFilteDialog: PropTypes.func.isRequired
};

export default FilterModal;
