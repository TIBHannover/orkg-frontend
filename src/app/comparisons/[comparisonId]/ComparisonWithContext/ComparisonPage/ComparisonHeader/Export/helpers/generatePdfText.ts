import type { jsPDF } from 'jspdf';

import {
    buildPdfTable,
    getBaseTableConfig,
    getPdfCellContent,
    type PdfCell,
    type PdfRow,
    type RGB,
} from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/pdfUtils';
import { DEFAULT_COLUMN_WIDTH } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { ComparisonContents, ComparisonTableColumn } from '@/services/backend/types';
import { getPublicUrl } from '@/utils';

/** Wide-page: one oversized landscape page. Chunked: A4 pages split by source columns. */
type ExportMode = 'single' | 'chunked';

type AutoTableFn = (doc: jsPDF, options: Record<string, unknown>) => void;

type GeneratePdfTextParams = {
    mode: ExportMode;
    comparisonId: string;
    comparisonContents: ComparisonContents;
    columns: ComparisonTableColumn[];
    /** Same filter mask as the on-screen table — only matching source columns are exported. */
    activeColumns: boolean[];
    /** Screen min-width from the column-width menu (px); mapped to mm, not converted 1:1. */
    columnWidth: number;
    title: string;
};

const PROPERTY_COLUMN_COUNT = 1;
const PROPERTY_COL_WIDTH = 40;
const PAGE_MARGIN = 20;
const TABLE_START_Y = 20;
const ORKG_PRIMARY: RGB = [236, 98, 96];
const MIN_WIDE_PAGE_HEIGHT = 210;
const WIDE_PAGE_BOTTOM_PADDING = 20;
const CELL_HORIZONTAL_PADDING = 4;
const CELL_VERTICAL_PADDING = 4;
const PDF_POINT_TO_MM = 0.352778;
const AVERAGE_CHARACTER_WIDTH_EM = 0.5;
const LINE_HEIGHT = 1.15;
const WIDE_PAGE_HEIGHT_BUFFER = 1.2;

// Map the UI default (250px) to a sensible PDF default (25mm), clamped to printable bounds.
const DEFAULT_PDF_DATA_COL_WIDTH = 25;
const MIN_PDF_DATA_COL_WIDTH = 18;
const MAX_PDF_DATA_COL_WIDTH = 50;

const getFontSize = (dataColCount: number) => {
    if (dataColCount > 30) return 5;
    if (dataColCount > 15) return 6;
    return 7;
};

/** Relative mapping from screen min-width to PDF mm — acts as a floor, not an exact width. */
const pxToPdfColumnWidth = (columnWidthPx: number) =>
    Math.min(MAX_PDF_DATA_COL_WIDTH, Math.max(MIN_PDF_DATA_COL_WIDTH, (columnWidthPx / DEFAULT_COLUMN_WIDTH) * DEFAULT_PDF_DATA_COL_WIDTH));

/** When few columns fit on a page, expand them equally so the table uses the full width. */
const stretchColumnWidth = (minWidth: number, availableWidth: number, columnCount: number) => Math.max(minWidth, availableWidth / columnCount);

/** Fixed equal widths prevent jspdf-autotable from shrinking columns based on cell content. */
const getColumnStyles = (columnCount: number, dataColWidth: number) =>
    Object.fromEntries(Array.from({ length: columnCount }, (_, index) => [index, { cellWidth: index === 0 ? PROPERTY_COL_WIDTH : dataColWidth }]));

const estimateLineCount = (text: string, cellWidth: number, fontSize: number) => {
    const availableWidth = Math.max(1, cellWidth - CELL_HORIZONTAL_PADDING);
    const averageCharacterWidth = fontSize * PDF_POINT_TO_MM * AVERAGE_CHARACTER_WIDTH_EM;

    return text
        .split('\n')
        .map((line) => Math.max(1, Math.ceil((line.length * averageCharacterWidth) / availableWidth)))
        .reduce((sum, lineCount) => sum + lineCount, 0);
};

const estimateRowHeight = (row: PdfCell[], columnWidths: number[], fontSize: number) => {
    const lineCount = Math.max(
        ...row.map((cell, index) =>
            estimateLineCount(getPdfCellContent(cell), columnWidths[index] ?? columnWidths.at(-1) ?? PROPERTY_COL_WIDTH, fontSize),
        ),
    );

    return lineCount * fontSize * PDF_POINT_TO_MM * LINE_HEIGHT + CELL_VERTICAL_PADDING;
};

const estimateWidePageHeight = ({
    headerRow,
    dataRows,
    fontSize,
    dataColWidth,
}: {
    headerRow: PdfCell[];
    dataRows: PdfCell[][];
    fontSize: number;
    dataColWidth: number;
}) => {
    const columnWidths = headerRow.map((_, index) => (index === 0 ? PROPERTY_COL_WIDTH : dataColWidth));
    const tableHeight = [headerRow, ...dataRows].reduce((height, row) => height + estimateRowHeight(row, columnWidths, fontSize), 0);

    return Math.max(MIN_WIDE_PAGE_HEIGHT, Math.ceil(TABLE_START_Y + tableHeight * WIDE_PAGE_HEIGHT_BUFFER + WIDE_PAGE_BOTTOM_PADDING));
};

const getPageOrientation = (pageWidth: number, pageHeight: number) => (pageWidth >= pageHeight ? 'l' : 'p');

const TITLE_X = 14;
const TITLE_Y = 15;
const FOOTER_X = 10;
const PAGE_NUMBER_Y_OFFSET = 10;

const addTitle = (pdf: jsPDF, title: string, url: string) => {
    pdf.setFontSize(12);
    pdf.textWithLink(title, TITLE_X, TITLE_Y, { url });
};

const addFooter = (pdf: jsPDF, comparisonUrl: string) => {
    const pageCount = pdf.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);

        const y = pdf.internal.pageSize.getHeight() - PAGE_NUMBER_Y_OFFSET;
        pdf.textWithLink(comparisonUrl, FOOTER_X, y, { url: comparisonUrl });
        pdf.text(`Page ${page} of ${pageCount}`, pdf.internal.pageSize.getWidth() - 30, y);
    }
};

const renderTable = ({
    pdf,
    autoTable,
    headerRow,
    dataRows,
    pdfRows,
    fontSize,
    dataColWidth,
    title,
    comparisonUrl,
}: {
    pdf: jsPDF;
    autoTable: AutoTableFn;
    headerRow: PdfCell[];
    dataRows: PdfCell[][];
    pdfRows: PdfRow[];
    fontSize: number;
    dataColWidth: number;
    title: string;
    comparisonUrl: string;
}) => {
    addTitle(pdf, title, comparisonUrl);

    autoTable(pdf, {
        head: [headerRow],
        body: dataRows,
        startY: TABLE_START_Y,
        ...getBaseTableConfig(pdf, fontSize, pdfRows),
        columnStyles: getColumnStyles(headerRow.length, dataColWidth),
        headStyles: { fillColor: ORKG_PRIMARY, textColor: 255, fontStyle: 'bold', halign: 'left' },
    });
};

const generatePdfText = async ({ mode, comparisonId, comparisonContents, columns, activeColumns, columnWidth, title }: GeneratePdfTextParams) => {
    const table = buildPdfTable({
        paths: comparisonContents.selected_paths,
        values: comparisonContents.values,
        columns,
        activeColumns,
    });
    if (!table) return;

    const { headerRow, dataRows, pdfRows } = table;
    const comparisonUrl = `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId })}`;

    // Dynamic import keeps jspdf (~500KB) out of the main comparison bundle.
    const [jsPDFModule, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.autoTable ?? autoTableModule.default;

    if (!autoTable) {
        throw new Error('Failed to load PDF table plugin');
    }

    const dataColCount = headerRow.length - PROPERTY_COLUMN_COUNT;
    const fontSize = getFontSize(dataColCount);
    const dataColWidth = pxToPdfColumnWidth(columnWidth);

    if (mode === 'single') {
        // Custom page size so all source columns and rows fit on one page.
        // Keep fixed column widths — do not stretch to fill A4, or wide mode looks identical to print-friendly.
        const pageWidth = Math.max(297, PROPERTY_COL_WIDTH + dataColCount * dataColWidth + PAGE_MARGIN);
        const pageHeight = estimateWidePageHeight({ headerRow, dataRows, fontSize, dataColWidth });
        const pdf = new jsPDF({ orientation: getPageOrientation(pageWidth, pageHeight), unit: 'mm', format: [pageWidth, pageHeight] });

        renderTable({
            pdf,
            autoTable,
            headerRow,
            dataRows,
            pdfRows,
            fontSize,
            dataColWidth,
            title,
            comparisonUrl,
        });
        addFooter(pdf, comparisonUrl);
        pdf.save(`${title} (Wide).pdf`);
        return;
    }

    // Chunked: split source columns across A4 landscape pages, keeping the property column on each page.
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const availableWidth = pageWidth - PAGE_MARGIN - PROPERTY_COL_WIDTH;
    const columnsPerPage = Math.max(1, Math.floor(availableWidth / dataColWidth));
    const chunkCount = Math.ceil(dataColCount / columnsPerPage);

    for (let index = 0; index < chunkCount; index += 1) {
        if (index > 0) pdf.addPage();

        const start = PROPERTY_COLUMN_COUNT + index * columnsPerPage;
        const end = Math.min(start + columnsPerPage, headerRow.length);
        const columnsInChunk = end - start;
        const chunkColWidth = stretchColumnWidth(dataColWidth, availableWidth, columnsInChunk);
        const chunkTitle = chunkCount > 1 ? `${title} (${index + 1}/${chunkCount})` : title;

        renderTable({
            pdf,
            autoTable,
            headerRow: [headerRow[0], ...headerRow.slice(start, end)],
            dataRows: dataRows.map((row) => [row[0], ...row.slice(start, end)]),
            pdfRows,
            fontSize,
            dataColWidth: chunkColWidth,
            title: chunkTitle,
            comparisonUrl,
        });
    }

    addFooter(pdf, comparisonUrl);
    pdf.save(`${title} (Printable).pdf`);
};

export default generatePdfText;
