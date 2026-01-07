import React from 'react';
import useSWR from 'swr';

import { getThing, thingsUrl } from '@/services/backend/things';

const ColumnOption = ({ column }: { column: string }) => {
    const { data: entity, isLoading } = useSWR(
        column && column.startsWith('orkg:') ? [column.replace('orkg:', ''), thingsUrl, 'getThing'] : null,
        ([params]) => getThing(params),
    );
    if (isLoading) return <option>Loading...</option>;
    if (!entity) return <option key={`column${column}`}>{column}</option>;
    return <option key={`column${column}`}>{entity.label}</option>;
};

export default ColumnOption;
