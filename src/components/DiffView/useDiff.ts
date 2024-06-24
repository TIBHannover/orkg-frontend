import { useCallback } from 'react';
import { isString } from 'lodash';
import { LiteratureList } from 'services/backend/types';
import { isListSection, isTextSection } from 'components/List/helpers/typeGuards';

const useDiff = () => {
    // @ts-expect-error awaiting TS migration
    const reviewToPlainText = useCallback((article) => {
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

    const listToPlainText = useCallback((article: LiteratureList) => {
        let articleText = '';
        articleText += `Title: ${article.title}\n\n`;

        if (article.research_fields?.[0]) {
            articleText += `Research field: ${article.research_fields?.[0]?.label}\n\n`;
        }

        for (const [index, author] of article.authors.entries()) {
            articleText += `Author ${index + 1}: ${author.name}\n`;
        }

        for (const section of article.sections) {
            articleText += '------------------Section------------------\n';

            if (isTextSection(section)) {
                articleText += `Title: ${section.heading}\n`;
                articleText += `Content:\n${section.text}\n\n`;
            }
            if (isListSection(section)) {
                articleText += 'Section entries:\n';
                for (const entry of section.entries) {
                    articleText += `Entry: ${entry.value.label}`;
                    if (entry.description) {
                        articleText += `\nDescription: ${entry.description}`;
                    }
                    articleText += '\n\n';
                }
            }
        }

        return articleText;
    }, []);

    // @ts-expect-error awaiting TS migration
    const comparisonToPlainText = useCallback((comparison) => {
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

        // @ts-expect-error awaiting TS migration
        for (const [index, contribution] of comparison.contributions.sort((a, b) => a.id.localeCompare(b.id)).entries()) {
            comparisonText += `Contribution ${index + 1}: ${contribution.label}\n`;
        }

        for (const [index, reference] of comparison.references.entries()) {
            comparisonText += `Reference ${index + 1}: ${reference.label}\n`;
        }
        // @ts-expect-error awaiting TS migration
        for (const [index, property] of comparison.properties.sort((a, b) => a.id.localeCompare(b.id)).entries()) {
            comparisonText += `Property ${index + 1}: ${property.label}\n`;
        }

        return comparisonText;
    }, []);

    const isOldIdHigherThanNewId = useCallback(({ oldId, newId }: { oldId: string; newId: string }) => {
        const numericOldId = isString(oldId) && parseInt(oldId.replace('R', ''));
        const numericNewId = isString(newId) && parseInt(newId.replace('R', ''));

        return numericOldId > numericNewId;
    }, []);

    return { reviewToPlainText, comparisonToPlainText, isOldIdHigherThanNewId, listToPlainText };
};

export default useDiff;
