import { CLASSES } from '@/constants/graphSettings';
import { getComparison, getComparisonContents } from '@/services/backend/comparisons';
import { getPaper } from '@/services/backend/papers';
import { getReview } from '@/services/backend/reviews';
import { Thing } from '@/services/backend/things';
import { getAbstractByDoi, getAbstractByTitle } from '@/services/semanticScholar';

export const parseComparison = async (item: Thing): Promise<string> => {
    try {
        const comparisonDetails = await getComparison(item.id);
        const comparisonContentsDetails = await getComparisonContents(item.id);

        if (comparisonDetails) {
            const { description } = comparisonDetails;
            const { titles } = comparisonContentsDetails;
            let paperTitles: string[] = [];

            if (titles.length > 0) {
                paperTitles = titles.map((title) => title?.label).filter(Boolean);
            }

            return [item.label, description, ...paperTitles].filter(Boolean).join(' - ');
        }
    } catch (error) {
        console.error(`Error fetching comparison data for ${item.id}:`, error);
    }
    return item.label || '';
};

export const parseSmartReview = async (item: Thing): Promise<string> => {
    try {
        const reviewDetails = await getReview(item.id);
        if (reviewDetails) {
            const { title, sections } = reviewDetails;
            let introductionText = '';
            const comparisonAbstracts: string[] = [];

            // Extract Introduction Text
            const introSection = sections.find((section) => section.heading === 'Introduction');
            if (introSection) {
                introductionText = introSection.text || '';
            }

            // Extract Comparisons and Fetch Their Data
            const comparisonSections = sections.filter((section) => section.type === 'comparison');

            const comparisonIds: string[] = comparisonSections.map((section) => section.comparison?.id).filter(Boolean) as string[];

            const comparisons = await Promise.all(comparisonIds.map((id) => getComparison(id)));
            const comparisonsContents = await Promise.all(comparisonIds.map((id) => getComparisonContents(id)));
            for (const [index, comparison] of comparisons.entries()) {
                try {
                    const { description, title: comparisonTitle } = comparison;

                    let paperTitles: string[] = [];

                    if (comparisonsContents?.[index]?.titles?.length > 0) {
                        paperTitles = comparisonsContents[index].titles.map((title) => title?.label).filter(Boolean);
                    }

                    const compText = [comparisonTitle || '', description, ...paperTitles].filter(Boolean).join(' - ');

                    comparisonAbstracts.push(compText);
                } catch (error) {
                    console.error(`Error fetching comparison data for ${comparison.id}:`, error);
                }
            }

            // Final Review Abstract
            return [title, introductionText, ...comparisonAbstracts].filter(Boolean).join(' - ');
        }
    } catch (error) {
        console.error(`Error fetching review data for ${item.id}:`, error);
    }
    return item.label || '';
};

export const parsePaper = async (item: Thing): Promise<string> => {
    try {
        const paper = await getPaper(item.id);
        if (paper) {
            const { title, identifiers } = paper;
            let _abstract = null;
            // try to fetch abstract by DOI
            if (identifiers.doi && identifiers.doi.length > 0) {
                try {
                    _abstract = await getAbstractByDoi(identifiers.doi[0]);
                } catch (e) {
                    console.error(e);
                }
            }
            // try to fetch abstract by title is no abstract was found by DOI
            if (!_abstract) {
                try {
                    const fetchResult = await getAbstractByTitle(title);
                    // @ts-expect-error not typed yet
                    _abstract = fetchResult?.abstract;
                } catch (e) {
                    console.error(e);
                }
            }
            return [item.label, _abstract || ''].filter(Boolean).join(' - ');
        }
    } catch (error) {
        console.error(`Error fetching paper data for ${item.id}:`, error);
    }
    return item.label || '';
};

export const CLASS_PARSERS = {
    [CLASSES.COMPARISON_PUBLISHED]: parseComparison,
    [CLASSES.SMART_REVIEW_PUBLISHED]: parseSmartReview,
    [CLASSES.PAPER]: parsePaper,
};
