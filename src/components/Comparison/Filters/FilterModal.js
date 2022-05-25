import { Modal, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import Joi from 'joi';
import CategoricalFilterRule from './CategoricalFilterRule.js';
import OrdinalFilterRule from './OrdinalFilterRule.js';
import TextFilterRule from './TextFilterRule.js';

function FilterModal(props) {
    const { data, updateRulesOfProperty, showFilterDialog, toggleFilterDialog } = props;
    const { property, values, rules } = data;
    const { label: propertyName } = property;

    const isCategory = () => Object.keys(values).length > 1;
    const isNum = () => Object.keys(values).length === Object.keys(values).filter(value => !isNaN(value) && !isNaN(parseFloat(value))).length;
    const isDate = () =>
        Object.keys(values).length ===
        Object.keys(values).filter(value => {
            const { error } = Joi.date()
                .required()
                .validate(value);
            return !error;
        }).length;
    const isText = () =>
        Object.keys(values).length > 3 && Object.keys(values).length !== Object.keys(values).filter(value => value.split(' ').length < 6).length;

    const generateCategoricalFilter = () => (
        <CategoricalFilterRule dataController={{ property, values, rules, updateRulesOfProperty, toggleFilterDialog }} />
    );

    const generateOrdFilter = typeIsDate => (
        <OrdinalFilterRule dataController={{ property, rules, updateRulesOfProperty, typeIsDate, toggleFilterDialog }} />
    );

    const generateTextFilter = () => <TextFilterRule dataController={{ property, values, rules, updateRulesOfProperty, toggleFilterDialog }} />;

    const generateFilter = () => {
        if (isNum()) {
            return generateOrdFilter(false);
        }
        if (isDate()) {
            return generateOrdFilter(true);
        }
        if (isText()) {
            return generateTextFilter();
        }
        if (isCategory()) {
            return generateCategoricalFilter();
        }
        return <></>;
    };
    return (
        <Modal isOpen={showFilterDialog} toggle={toggleFilterDialog}>
            <ModalHeader toggle={toggleFilterDialog}>Filter: {propertyName}</ModalHeader>
            {generateFilter()}
        </Modal>
    );
}

FilterModal.propTypes = {
    data: PropTypes.object.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired,
    showFilterDialog: PropTypes.bool.isRequired,
    toggleFilterDialog: PropTypes.func.isRequired,
};

export default FilterModal;
