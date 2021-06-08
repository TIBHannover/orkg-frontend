import { useCallback } from 'react';
import { isString } from 'lodash';

const useDiff = () => {
    const comparisonToPlainText = useCallback(comparison => {
        let comparisonText = '';
        comparisonText += `Title: ${comparison.label}\n\n`;

        if (comparison.researchField) {
            comparisonText += `Research field: ${comparison.researchField.label}\n\n`;
        }

        if (comparison.description) {
            comparisonText += `Description: ${comparison.description}\n\n`;
        }

        for (const [index, author] of comparison.authors.entries()) {
            comparisonText += `Author ${index + 1}: ${author.label}\n`;
        }

        if (comparison.doi) {
            comparisonText += `DOI: ${comparison.doi}\n\n`;
        }

        for (const [index, contribution] of comparison.contributions.sort((a, b) => a.id.localeCompare(b.id)).entries()) {
            comparisonText += `Contribution ${index + 1}: ${contribution.label}\n`;
        }

        for (const [index, reference] of comparison.reference.entries()) {
            comparisonText += `Reference ${index + 1}: ${reference.label}\n`;
        }

        for (const [index, property] of comparison.properties.sort((a, b) => a.id.localeCompare(b.id)).entries()) {
            comparisonText += `Property ${index + 1}: ${property.label}\n`;
        }

        return comparisonText;
    }, []);

    const isOldIdHigherThanNewId = useCallback(({ oldId, newId }) => {
        const numericOldId = isString(oldId) && parseInt(oldId.replace('R', ''));
        const numericNewId = isString(newId) && parseInt(newId.replace('R', ''));

        return numericOldId > numericNewId;
    }, []);

    return { comparisonToPlainText, isOldIdHigherThanNewId };
};

export default useDiff;
