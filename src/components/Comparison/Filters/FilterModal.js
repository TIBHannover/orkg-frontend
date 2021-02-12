import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import CategoricalFilterRule from './CategoricalFilterRule.js';
import OrdinalFilterRule from './OrdinalFilterRule.js';
import Joi from '@hapi/joi';
import JoiDate from '@hapi/joi-date';
import TextFilterRule from './TextFilterRule.js';

function FilterModal(props) {
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
        return (
            Object.keys(values).length ===
            Object.keys(values).filter(value => {
                const { error } = Joi.extend(JoiDate)
                    .date()
                    .format('YYYY-MM-DD')
                    .required()
                    .validate(value);
                return !error ? true : false;
            }).length
        );
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
        <OrdinalFilterRule dataController={{ property, rules, updateRulesOfProperty, typeIsDate: typeIsDate, toggleFilterDialog }} />
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
