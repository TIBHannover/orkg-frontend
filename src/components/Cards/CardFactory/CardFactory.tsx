import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import ListCard from 'components/Cards/ListCard/ListCard';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ReviewCard from 'components/Cards/ReviewCard/ReviewCard';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import RSTemplateCard from 'components/Cards/RSTemplateCard/RSTemplateCard';
import { ChangeEvent, FC } from 'react';
import { Comparison, Item, LiteratureList, Paper, Review, Template, Visualization, RosettaStoneTemplate } from 'services/backend/types';

type CardFactoryProps = {
    item: Item;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    showAddToComparison?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const CardFactory: FC<CardFactoryProps> = ({ item, showBadge, showCurationFlags, showAddToComparison, selectable, selected, onSelect }) => {
    if (item._class === 'paper') {
        return (
            <PaperCard
                paper={item as Paper}
                showBadge={showBadge}
                showCurationFlags={showCurationFlags}
                showAddToComparison={showAddToComparison}
                selectable={selectable}
                selected={selected}
                onSelect={onSelect}
            />
        );
    }
    if (item._class === 'comparison') {
        return <ComparisonCard comparison={item as Comparison} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (item._class === 'visualization') {
        return <VisualizationCard visualization={item as Visualization} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (item._class === 'smart-review') {
        return <ReviewCard review={item as Review} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (item._class === 'literature-list') {
        return <ListCard list={item as LiteratureList} showBadge={showBadge} showCurationFlags={showCurationFlags} />;
    }
    if (item._class === 'template') {
        return <TemplateCard template={item as Template} showBadge={showBadge} />;
    }
    if ('example_usage' in item) {
        return <RSTemplateCard template={item as RosettaStoneTemplate} showBadge={showBadge} />;
    }
    return null;
};

export default CardFactory;
