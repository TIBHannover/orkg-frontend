import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import PaperCard from 'components/PaperCard/PaperCard';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import ReviewCard from 'components/ReviewCard/ReviewCard';
import ListCard from 'components/List/ListCard';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';

const CardFactory = ({ item, showBadge, showCurationFlags, showAddToComparison }) => {
    const findClass = useCallback(
        classId => {
            return item?.classes?.includes(classId);
        },
        [item?.classes]
    );

    if (findClass(CLASSES.PAPER)) {
        return (
            <PaperCard
                paper={{
                    id: item.id,
                    title: item.label,
                    ...item
                }}
                showBadge={showBadge}
                showCurationFlags={showCurationFlags}
                showAddToComparison={showAddToComparison}
            />
        );
    }
    if (findClass(CLASSES.COMPARISON)) {
        return (
            <ComparisonCard
                comparison={{
                    id: item.id,
                    title: item.label,
                    ...item
                }}
                showBadge={showBadge}
                showCurationFlags={showCurationFlags}
            />
        );
    }
    if (findClass(CLASSES.VISUALIZATION)) {
        return (
            <VisualizationCard
                visualization={{
                    id: item.id,
                    title: item.label,
                    ...item
                }}
                showBadge={showBadge}
                showCurationFlags={showCurationFlags}
            />
        );
    }
    if (findClass(CLASSES.SMART_REVIEW) || findClass(CLASSES.SMART_REVIEW_PUBLISHED)) {
        return <ReviewCard versions={[item]} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (findClass(CLASSES.LITERATURE_LIST) || findClass(CLASSES.LITERATURE_LIST_PUBLISHED)) {
        return <ListCard versions={[item]} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    return null;
};

CardFactory.propTypes = {
    item: PropTypes.object.isRequired,
    showBadge: PropTypes.bool,
    showCurationFlags: PropTypes.bool,
    showAddToComparison: PropTypes.bool
};

export default CardFactory;
