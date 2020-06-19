import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';

/**
 * Check if the input filed is Literal
 *  (if one of the default data type: Date, String, Number)
 * @param {Object[]} components Array of components
 * @return {Boolean} if this input field is Literal
 */
export const isLiteral = components => {
    let isLiteral = false;
    for (const typeId of components.map(tc => tc.value.id)) {
        if (defaultDatatypes.map(t => t.id).includes(typeId)) {
            isLiteral = true;
            break;
        }
    }
    return isLiteral;
};

/**
 * Get the type of value
 * @param {Object[]} components Array of components
 * @return {Object=} the class of value or null
 */
export const getValueClass = components => {
    return components && components.length > 0 && components[0].value && components[0].value.id ? components[0].value : null;
};

/**
 * Check if the resource has an inline format
 * (its template has hasLabelFormat == true)
 * @param {Object} state Current state of the Store
 * @param {Object[]} components Array of components
 * @return {String|Boolean} the template label or false
 */
export function isInlineResource(state, valueClass) {
    if (valueClass && !defaultDatatypes.map(t => t.id).includes(valueClass.id)) {
        if (state.statementBrowser.classes[valueClass.id] && state.statementBrowser.classes[valueClass.id].templateIds) {
            const templateIds = state.statementBrowser.classes[valueClass.id].templateIds;
            //check if it's an inline resource
            for (const templateId of templateIds) {
                const template = state.statementBrowser.templates[templateId];
                if (template && template.hasLabelFormat) {
                    return template.label;
                }
            }
        }
    }
    return false;
}
