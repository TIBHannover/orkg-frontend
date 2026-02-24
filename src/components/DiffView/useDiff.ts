import { uniqBy } from 'lodash';
import { useCallback } from 'react';

import { flattenPaths } from '@/components/Comparison/hooks/useComparison';
import { isListSection, isTextSection } from '@/components/List/helpers/typeGuards';
import { SectionContentLinkTypes } from '@/components/Review/Sections/ContentLink/ContentLink';
import { Comparison, ComparisonContents, LiteratureList, Review } from '@/services/backend/types';

const useDiff = () => {
    const reviewToPlainText = useCallback((article: Review) => {
        let articleText = '';
        articleText += `Title: ${article.title}\n\n`;

        if (article.research_fields?.[0]) {
            articleText += `Research field: ${article.research_fields?.[0].label}\n\n`;
        }

        for (const [index, author] of article.authors.entries()) {
            articleText += `Author ${index + 1}: ${author.name}\n`;
        }

        for (const section of article.sections) {
            articleText += '------------------Section------------------\n';
            articleText += `Title: ${section.heading}\n`;
            articleText += `Type: ${section.type}\n`;

            if (section.type === 'text' && section.text) {
                articleText += `Content:\n${section.text}\n\n`;
            }
            if (['resource', 'property', 'comparison', 'visualization'].includes(section.type)) {
                const sectionType: SectionContentLinkTypes =
                    section.type !== 'property' ? (section.type as SectionContentLinkTypes) : ('predicate' as SectionContentLinkTypes);

                articleText += `Link to: ${section?.[sectionType]?.id} (${section?.[sectionType]?.label})\n\n`;
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

    const comparisonToPlainText = useCallback(
        ({ comparison, comparisonContents }: { comparison: Comparison; comparisonContents: ComparisonContents }) => {
            const predicates = uniqBy(flattenPaths(comparisonContents.selected_paths ?? []), 'id');
            let comparisonText = '';
            comparisonText += `Title: ${comparison.title}\n\n`;

            if (comparison.research_fields?.[0]) {
                comparisonText += `Research field: ${comparison.research_fields?.[0]?.label}\n\n`;
            }

            if (comparison.description) {
                comparisonText += `Description: ${comparison.description}\n\n`;
            }

            for (const [index, author] of comparison.authors.entries()) {
                comparisonText += `Author ${index + 1}: ${author.name}\n`;
            }

            if (comparison.identifiers?.doi?.[0]) {
                comparisonText += `DOI: ${comparison.identifiers?.doi?.[0]}\n\n`;
            }

            const entities = comparisonContents.titles
                .map((title, i) => ({ title, subtitle: comparisonContents.subtitles[i] ?? null }))
                .sort((a, b) => (a.subtitle?.id ?? a.title.id).localeCompare(b.subtitle?.id ?? b.title.id));
            for (const [index, entity] of entities.entries()) {
                comparisonText += `Entity ${index + 1}: ${entity.title.label} ${entity.subtitle?.label}\n`;
            }

            for (const [index, reference] of comparison.references.entries()) {
                comparisonText += `Reference ${index + 1}: ${reference}\n`;
            }

            for (const [index, property] of predicates.entries()) {
                comparisonText += `Property ${index + 1}: ${property.label}\n`;
            }

            return comparisonText;
        },
        [],
    );

    return { reviewToPlainText, comparisonToPlainText, listToPlainText };
};

export default useDiff;
