import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import CategoricalFilterRule from './CategoricalFilterRule.js';
import OrdinalFilterRule from './OrdinalFilterRule.js';
import TextFilterRule from './TextFilterRule.js';

function FilterModal(props) {
    const DATE_FORMAT = /\d{4}-[01]\d-([012]\d|30|31)/;
    const { data, updateRulesOfProperty, showFilterDialog, toggleFilterDialog } = props;
    const { property, values, rules } = data;
    const { label: propertyName } = property;

    const isCategory = () => {
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

    const generateCategoricalFilter = () => (
        <CategoricalFilterRule dataController={{ property, values, rules, updateRulesOfProperty, toggleFilterDialog }} />
    );

    const generateOrdFilter = typeIsDate => (
        <OrdinalFilterRule dataController={{ property, rules, updateRulesOfProperty, typeIsDate: typeIsDate, DATE_FORMAT, toggleFilterDialog }} />
    );

    const generateTextFilter = () => <TextFilterRule dataController={{ property, values, rules, updateRulesOfProperty, toggleFilterDialog }} />;

    const generateFilter = () => {
        if (isNum()) {
            return generateOrdFilter(false);
        } else if (isDate()) {
            return generateOrdFilter(true);
        } else if (isText()) {
            return generateTextFilter();
        } else if (isCategory()) {
            return generateCategoricalFilter();
        }
        return <></>;
    };
    return (
        <Modal isOpen={showFilterDialog} toggle={toggleFilterDialog}>
            <ModalHeader toggle={toggleFilterDialog}>Filter: {propertyName}</ModalHeader>
            <ModalBody>{generateFilter()}</ModalBody>
        </Modal>
    );
}

FilterModal.propTypes = {
    data: PropTypes.object.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired,
    showFilterDialog: PropTypes.bool.isRequired,
    toggleFilterDialog: PropTypes.func.isRequired
};

export default FilterModal;
