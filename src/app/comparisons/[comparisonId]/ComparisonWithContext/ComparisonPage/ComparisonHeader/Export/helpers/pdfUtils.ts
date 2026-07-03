import type { jsPDF } from 'jspdf';
import type { CellHookData, UserOptions } from 'jspdf-autotable';

import formatPdfValue from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/formatPdfValue';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { ComparisonPath, ComparisonTableColumn, SelectedPathValues, ThingReference } from '@/services/backend/types';
import { getPublicUrl } from '@/utils';

export type RGB = [number, number, number];

/** AutoTable cell with optional link to an ORKG entity page. */
export type PdfCell = {
    content: string;
    url?: string;
};

/** One flattened row for PDF rendering, with nesting depth for styling. */
export type PdfRow = {
    depth: number;
    label: PdfCell;
    values: PdfCell[];
};

const buildEntityUrl = (route: string, params: Record<string, string>) => `${getPublicUrl()}${reverse(route, params)}`;

/** Entity page URL for non-literal thing references; literals stay plain text. */
export const getThingUrl = (value: ThingReference): string | undefined => {
    if (value._class === 'literal_ref' || !value.id) return undefined;

    switch (value._class) {
        case 'resource_ref':
            return buildEntityUrl(ROUTES.RESOURCE, { id: value.id });
        case 'predicate_ref':
            return buildEntityUrl(ROUTES.PROPERTY, { id: value.id });
        case 'class_ref':
            return buildEntityUrl(ROUTES.CLASS, { id: value.id });
        default:
            return undefined;
    }
};

export const toPdfCell = (value?: ThingReference | null): PdfCell => {
    const content = formatPdfValue(value);
    const url = value ? getThingUrl(value) : undefined;
    return url ? { content, url } : { content };
};

/** Text content from an AutoTable cell raw value (string or PdfCell). */
export const getPdfCellContent = (raw: unknown): string => {
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
    if (typeof raw === 'object' && 'content' in raw) return String((raw as PdfCell).content);
    return String(raw);
};

const getPdfCellUrl = (raw: unknown): string | undefined => {
    if (typeof raw === 'object' && raw !== null && 'url' in raw) {
        const { url } = raw as PdfCell;
        return url || undefined;
    }
    return undefined;
};

const MAX_DB_LEVEL = 10;
const TREE_INDENT = 2.5;
const TREE_LINE_START = 3;

// Light-mode --color-secondary (FirstColumnHeader uses bg-secondary on the web).
const ORKG_SECONDARY: RGB = [128, 134, 155];

// Light-mode approximations of --db-level-* from globals.css (see getBackgroundColor in dataBrowserUtils).
const PDF_LEVEL_COLORS: RGB[] = [
    [255, 255, 255],
    [242, 242, 243],
    [236, 236, 237],
    [230, 230, 231],
    [224, 224, 225],
    [218, 218, 219],
    [212, 212, 213],
    [206, 206, 207],
    [200, 200, 201],
    [194, 194, 195],
    [188, 188, 189],
];

const getPdfLevelColor = (depth: number): RGB => PDF_LEVEL_COLORS[Math.min(Math.max(depth, 0), MAX_DB_LEVEL)];

/**
 * Walks the nested backend tree (same shape as SelectedPath) and produces flat PDF rows.
 * depth matches the UI: getBackgroundColor(path.length - 1).
 */
export const collectPdfRows = ({
    paths,
    values,
    activeColumns,
    parentPath = [],
}: {
    paths: ComparisonPath[];
    values: Record<string, SelectedPathValues[]>;
    activeColumns: boolean[];
    parentPath?: string[];
}): PdfRow[] => {
    const rows: PdfRow[] = [];

    for (const pathNode of paths) {
        const path = [...parentPath, pathNode.id];
        const pathRows = values[pathNode.id] ?? [];

        for (const row of pathRows) {
            rows.push({
                depth: path.length - 1,
                label: {
                    content: pathNode.label,
                    url: buildEntityUrl(ROUTES.PROPERTY, { id: pathNode.id }),
                },
                values: activeColumns.flatMap((isActive, index) => (isActive ? [toPdfCell(row.values[index])] : [])),
            });

            if (pathNode.children.length > 0) {
                rows.push(
                    ...collectPdfRows({
                        paths: pathNode.children,
                        values: row.children ?? {},
                        activeColumns,
                        parentPath: path,
                    }),
                );
            }
        }
    }

    return rows;
};

/** Builds jspdf-autotable head/body arrays from nested comparison data. */
export const buildPdfTable = ({
    paths,
    values,
    columns,
    activeColumns,
}: {
    paths: ComparisonPath[];
    values: Record<string, SelectedPathValues[]>;
    columns: ComparisonTableColumn[];
    activeColumns: boolean[];
}) => {
    const pdfRows = collectPdfRows({ paths, values, activeColumns });
    if (pdfRows.length === 0) return null;

    const visibleColumns = columns.filter((_, index) => activeColumns[index]);
    const headerRow: PdfCell[] = [
        { content: 'Property' },
        ...visibleColumns.map((column) => {
            const title = column.title.label;
            const subtitle = column.subtitle?.label;
            const resourceId = column.subtitle?.id ?? column.title.id;
            return {
                content: subtitle ? `${title}\n${subtitle}` : title,
                url: buildEntityUrl(ROUTES.RESOURCE, { id: resourceId }),
            };
        }),
    ];

    const dataRows: PdfCell[][] = pdfRows.map((row) => [row.label, ...row.values]);

    return { headerRow, dataRows, pdfRows };
};

/** Vertical/horizontal guide lines in the property column to show nesting depth. */
const drawTreeGuides = (pdf: jsPDF, data: CellHookData, pdfRows: PdfRow[]) => {
    if (data.section !== 'body' || data.column.index !== 0) return;

    const row = pdfRows[data.row.index];
    if (!row || row.depth === 0) return;

    const startX = data.cell.x + TREE_LINE_START;
    const endY = data.cell.y + data.cell.height;
    const middleY = data.cell.y + data.cell.height / 2;

    pdf.setDrawColor(170, 170, 170);
    pdf.setLineWidth(0.15);

    for (let level = 1; level <= row.depth; level += 1) {
        const x = startX + (level - 1) * TREE_INDENT;
        pdf.line(x, data.cell.y, x, endY);
    }

    const currentLevelX = startX + (row.depth - 1) * TREE_INDENT;
    pdf.line(currentLevelX, middleY, currentLevelX + TREE_INDENT - 0.5, middleY);
};

const drawCellLink = (pdf: jsPDF, data: CellHookData) => {
    const url = getPdfCellUrl(data.cell.raw);
    if (!url) return;

    pdf.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url });
};

export const getBaseTableConfig = (pdf: jsPDF, fontSize: number, pdfRows: PdfRow[]): UserOptions => ({
    styles: {
        fontSize,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        lineColor: [100, 100, 100],
        lineWidth: 0.3,
    },
    margin: { top: 20, left: 10, right: 10, bottom: 15 },
    didParseCell: (data) => {
        // ZapfDingbats is one of the 14 standard PDF fonts built into every PDF viewer — no embedding needed.
        // In its encoding, '4' is a heavy checkmark and '8' is a heavy cross.
        const cellContent = getPdfCellContent(data.cell.raw);
        if (cellContent === 'Yes' || cellContent === 'No') {
            const isYes = cellContent === 'Yes';
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.font = 'zapfdingbats';
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.textColor = isYes ? [34, 139, 34] : [220, 53, 69];
            // eslint-disable-next-line no-param-reassign
            data.cell.text = [isYes ? '4' : '8'];
        }

        if (data.section === 'head' && data.column.index === 0) {
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.fillColor = ORKG_SECONDARY;
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.textColor = 255;
            return;
        }

        if (data.section !== 'body') return;

        const row = pdfRows[data.row.index];
        if (!row) return;

        // Match on-screen nesting background from --db-level-*.
        // eslint-disable-next-line no-param-reassign
        data.cell.styles.fillColor = getPdfLevelColor(row.depth);

        if (data.column.index === 0) {
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.fontStyle = 'bold';
            // eslint-disable-next-line no-param-reassign
            data.cell.styles.cellPadding = {
                top: 2,
                right: 2,
                bottom: 2,
                left: 2 + row.depth * TREE_INDENT,
            };
        }
    },
    didDrawCell: (data) => {
        drawTreeGuides(pdf, data, pdfRows);
        drawCellLink(pdf, data);
    },
});
