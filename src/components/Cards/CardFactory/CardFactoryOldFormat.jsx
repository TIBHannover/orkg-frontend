import PropTypes from 'prop-types';
import { useCallback } from 'react';

import ComparisonCard from '@/components/Cards/ComparisonCard/ComparisonCard';
import ListCard from '@/components/Cards/ListCard/ListCard';
import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import ReviewCard from '@/components/Cards/ReviewCard/ReviewCard';
import VisualizationCard from '@/components/Cards/VisualizationCard/VisualizationCard';
import { CLASSES } from '@/constants/graphSettings';
import {
    convertComparisonToNewFormat,
    convertListToNewFormat,
    convertPaperToNewFormat,
    convertReviewToNewFormat,
    convertVisualizationToNewFormat,
} from '@/utils';

const CardFactory = ({ item, showBadge, showCurationFlags, showAddToComparison }) => {
    const findClass = useCallback((classId) => item?.classes?.includes(classId), [item?.classes]);

    if (findClass(CLASSES.PAPER)) {
        return (
            <PaperCard
                paper={convertPaperToNewFormat(item)}
                showBadge={showBadge}
                showCurationFlags={showCurationFlags}
                showAddToComparison={showAddToComparison}
            />
        );
    }
    if (findClass(CLASSES.COMPARISON)) {
        return <ComparisonCard comparison={convertComparisonToNewFormat(item)} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (findClass(CLASSES.VISUALIZATION)) {
        return (
            <VisualizationCard visualization={convertVisualizationToNewFormat(item)} showBadge={showBadge} showCurationFlags={showCurationFlags} />
        );
    }
    if (findClass(CLASSES.SMART_REVIEW) || findClass(CLASSES.SMART_REVIEW_PUBLISHED)) {
        return <ReviewCard review={convertReviewToNewFormat([item])} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (findClass(CLASSES.LITERATURE_LIST) || findClass(CLASSES.LITERATURE_LIST_PUBLISHED)) {
        return <ListCard list={convertListToNewFormat([item])} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    return null;
};

CardFactory.propTypes = {
    item: PropTypes.object.isRequired,
    showBadge: PropTypes.bool,
    showCurationFlags: PropTypes.bool,
    showAddToComparison: PropTypes.bool,
};

export default CardFactory;
