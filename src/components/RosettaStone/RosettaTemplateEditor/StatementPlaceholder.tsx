import { parseInt } from 'lodash';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

import PositionCard from '@/components/RosettaStone/RosettaTemplateEditor/PositionCard';
import { useRosettaTemplateEditorState } from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { RSPropertyShape } from '@/services/backend/types';

function StatementPlaceholder() {
    const { properties } = useRosettaTemplateEditorState();
    const theme = useContext(ThemeContext);

    const renderCard = (property: RSPropertyShape, index: number) => {
        let color: string | undefined = '#5bafbd';
        let type = 'object';
        if (property && 'min_count' in property && property.min_count && parseInt(property.min_count.toString()) > 0) {
            color = '#107585';
        }
        if (index === 0) {
            type = 'subject';
            color = theme?.primary;
        }
        if (index === 1) {
            type = 'verb';
            color = theme?.secondary;
        }
        return <PositionCard key={property?.id} property={property} index={index} type={type} color={color} />;
    };

    return (
        <div className="flex flex-wrap items-center gap-2 rounded border border-separator bg-surface p-3">
            {properties.map((property, i) => renderCard(property, i))}
        </div>
    );
}

export default StatementPlaceholder;
