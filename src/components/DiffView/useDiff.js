import { useCallback } from 'react';
import { isString } from 'lodash';

const useDiff = () => {
    const reviewToPlainText = useCallback(article => {
        let articleText = '';
        articleText += `Title: ${article.paper.title}\n\n`;

        if (article.researchField) {
            articleText += `Research field: ${article.researchField.label}\n\n`;
        }

        for (const [index, author] of article.authorResources.entries()) {
            articleText += `Author ${index + 1}: ${author.label}\n`;
        }

        for (const section of article.sections) {
            articleText += '------------------Section------------------\n';
            articleText += `Title: ${section.title.label}\n`;
            articleText += `Type: ${section.type.id}\n`;

            if (section.markdown) {
                articleText += `Content:\n${section.markdown?.label}\n\n`;
            }
            if (section.contentLink) {
                articleText += `Link to: ${section.contentLink?.objectId} (${section.contentLink?.label})\n\n`;
            }
        }

        return articleText;
    }, []);

    const literatureListToPlainText = useCallback(article => {
        let articleText = '';
        articleText += `Title: ${article.literatureList.title}\n\n`;

        if (article.researchField) {
            articleText += `Research field: ${article.researchField.label}\n\n`;
        }

        for (const [index, author] of article.authorResources.entries()) {
            articleText += `Author ${index + 1}: ${author.label}\n`;
        }

        for (const section of article.sections) {
            articleText += '------------------Section------------------\n';
            articleText += `Title: ${section.title}\n`;

            if (section.content) {
                articleText += `Content:\n${section.content.text}\n\n`;
            }
            if (section.entries) {
                articleText += `Section entries:\n`;
                for (const entry of section.entries) {
                    articleText += `Paper: ${article?.papers?.[entry.paperId]?.paper?.label}`;
                    if (entry.description) {
                        articleText += `\nDescription: ${entry.description.label}`;
                    }
                    articleText += `\n\n`;
                }
            }
        }

        return articleText;
    }, []);

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

        for (const [index, reference] of comparison.references.entries()) {
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

    return { reviewToPlainText, comparisonToPlainText, isOldIdHigherThanNewId, literatureListToPlainText };
};

export default useDiff;
