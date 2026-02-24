import { FlatTableRow } from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import { ComparisonSelectedPathFlattened, ComparisonTableColumn } from '@/services/backend/types';

const generateMatrix = ({
    table,
    columns,
    predicates,
}: {
    table: FlatTableRow[];
    columns: ComparisonTableColumn[];
    predicates: ComparisonSelectedPathFlattened[];
}) => {
    const header = [
        'title',
        'subtitle',
        ...table.map((row) => row.path.map((pathId) => predicates.find((predicate) => predicate.id === pathId)?.label ?? '').join(' - ') ?? ''),
    ];
    const rows =
        table[0]?.values
            .map((_, colIndex) => table.map((row) => row.values[colIndex]?.label ?? ''))
            .map((row, index) => [columns[index]?.title?.label ?? '', columns[index]?.subtitle?.label ?? '', ...row]) ?? [];

    return [header, ...rows];
};

export default generateMatrix;
