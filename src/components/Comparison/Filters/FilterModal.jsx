import PropTypes from 'prop-types';
import { Modal, ModalHeader } from 'reactstrap';
import { z } from 'zod';

import CategoricalFilterRule from '@/components/Comparison/Filters/CategoricalFilterRule';
import OrdinalFilterRule from '@/components/Comparison/Filters/OrdinalFilterRule';
import TextFilterRule from '@/components/Comparison/Filters/TextFilterRule';

function FilterModal(props) {
    const { data, updateRulesOfProperty, showFilterDialog, toggleFilterDialog } = props;
    const { property, values, rules } = data;
    const { label: propertyName } = property;

    const vals = Object.keys(values)
        .map((key) => ({
            label: key,
            length: values[key].length,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const isCategory = () => Object.keys(values).length > 1;

    const isNum = () => Object.keys(values).length === Object.keys(values).filter((value) => !isNaN(value) && !isNaN(parseFloat(value))).length;

    const isDate = () =>
        Object.keys(values).length ===
        Object.keys(values).filter((value) => {
            const { error } = z.string().date().safeParse(value);
            return !error;
        }).length;

    const isText = () => {
        const valuesArray = Object.keys(values);
        // Check if total values are more than 3
        const hasMultipleValues = valuesArray.length > 3;
        // Check if there are values with more than 6 words
        const hasLongPhrases = valuesArray.length !== valuesArray.filter((value) => value.split(' ').length < 6).length;
        // Check if majority of values have length (number of items) more than 2
        const valuesWithLongLength = vals.filter((value) => value.length > 2).length;
        const majorityHasLongLength = valuesWithLongLength / vals.length < 0.5;

        return hasMultipleValues && hasLongPhrases && majorityHasLongLength;
    };

    const generateCategoricalFilter = () => (
        <CategoricalFilterRule dataController={{ property, values, rules, updateRulesOfProperty, toggleFilterDialog }} />
    );

    const generateOrdFilter = (typeIsDate) => (
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
