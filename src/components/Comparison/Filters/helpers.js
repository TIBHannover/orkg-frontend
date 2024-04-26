import { FILTER_TYPES } from 'constants/comparisonFilterTypes';

/**
 * get Rules by property id
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} Rules
 */
export const getRuleByProperty = (filterControlData, propertyId) => filterControlData.find((item) => item.property.id === propertyId)?.rules;

/**
 * get Values by property
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} values
 */
export const getValuesByProperty = (filterControlData, propertyId) => filterControlData.find((item) => item.property.id === propertyId)?.values;

/**
 * get data for each property
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} Data of the property
 */
export const getDataByProperty = (filterControlData, propertyId) => filterControlData.find((item) => item.property.id === propertyId);

/**
 * Check if the filters is empty
 *
 * @param {Array} data filters array
 * @return {Boolean} Whether the filters are empty or not
 */
export const areAllRulesEmpty = (data) => [].concat(...data.map((item) => item.rules)).length > 0;

/**
 * Comparison filter rules applying
 *
 */
const applyOneOf = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(...value.map((key) => data[key]));
};

const applyGte = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => parseFloat(key) >= parseFloat(value))
            .map((key) => data[key]),
    );
};

const applyLte = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => parseFloat(key) <= parseFloat(value))
            .map((key) => data[key]),
    );
};

const applyGteDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => key >= value)
            .map((key) => data[key]),
    );
};

const applyLteDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => key <= value)
            .map((key) => data[key]),
    );
};

const applyNotEq = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => !value.includes(parseFloat(key)))
            .map((key) => data[key]),
    );
};

const applyNotEqDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => !value.includes(key))
            .map((key) => data[key]),
    );
};

const applyInc = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter((key) => value.filter((val) => key.includes(val)).length > 0)
            .map((key) => data[key]),
    );
};

export const applyRule = ({ filterControlData, type, propertyId, value }) => {
    switch (type) {
        case FILTER_TYPES.ONE_OF:
            return applyOneOf({ filterControlData, propertyId, value });
        case FILTER_TYPES.GTE:
            return applyGte({ filterControlData, propertyId, value });
        case FILTER_TYPES.GTE_DATE:
            return applyGteDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.LTE:
            return applyLte({ filterControlData, propertyId, value });
        case FILTER_TYPES.NEQ_DATE:
            return applyNotEqDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.NEQ:
            return applyNotEq({ filterControlData, propertyId, value });
        case FILTER_TYPES.LTE_DATE:
            return applyLteDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.INC:
            return applyInc({ filterControlData, propertyId, value });
        default:
            return [];
    }
};

/**
 * Stringify filter type of comparison
 *
 * @param {String} type filter
 * @return {String} String
 */
export const stringifyType = (type) => {
    switch (type) {
        case FILTER_TYPES.ONE_OF:
            return 'is One of:';
        case FILTER_TYPES.GTE:
            return '>=';
        case FILTER_TYPES.GTE_DATE:
            return 'is after:';
        case FILTER_TYPES.LTE:
            return '<=';
        case FILTER_TYPES.NEQ_DATE:
            return '!=';
        case FILTER_TYPES.NEQ:
            return '!=';
        case FILTER_TYPES.LTE_DATE:
            return 'is before:';
        case FILTER_TYPES.INC:
            return 'includes one of:';
        default:
            return type;
    }
};
