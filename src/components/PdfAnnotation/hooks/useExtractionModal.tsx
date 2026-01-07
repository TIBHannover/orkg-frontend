import { HotTableRef } from '@handsontable/react-wrapper';
import { zip } from 'lodash';
import { RefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import { extractTable, nlpServiceUrl } from '@/services/orkgNlp/index';
import { setTableData } from '@/slices/pdfAnnotationSlice';
import { Annotation, RootStore } from '@/slices/types';

const useExtractionModal = ({ id, hotTableComponentRef }: { id: string; hotTableComponentRef: RefObject<HotTableRef> }) => {
    const dispatch = useDispatch();
    const pdf = useSelector((state: RootStore) => state.pdfAnnotation.pdf);
    const tableData = useSelector((state: RootStore) => state.pdfAnnotation.tableData[id]);

    const pxToPoint = (x: number) => (x * 72) / 96;

    const annotation = useSelector((state: RootStore) => state.pdfAnnotation.annotations.find((a) => a.id === id)) as Annotation;
    const scale = useSelector((state: RootStore) => state.pdfAnnotation.scale);
    const { x1, y1, x2, y2, width, height } = annotation?.position?.boundingRect;

    const { isLoading } = useSWR(
        annotation?.position?.boundingRect ? [annotation?.position, nlpServiceUrl, 'extractTable'] : null,
        async ([params]) => {
            const form = new FormData();
            form.append('file', await fetch(pdf as string).then((content) => content.blob()));

            // Tabula expects region in format: [top, left, bottom, right] = [y1, x1, y2, x2]
            // Account for PDF scale and convert to points
            // The coordinates are scaled by the PDF viewer scale, so we need to divide by scale first
            const actualScale = typeof scale === 'number' ? scale : 1;
            const tabulaRegion = [
                pxToPoint(y1 / actualScale), // top (y1) - unscale then convert to points
                pxToPoint(x1 / actualScale), // left (x1) - unscale then convert to points
                pxToPoint(y2 / actualScale), // bottom (y2) - unscale then convert to points
                pxToPoint(x2 / actualScale), // right (x2) - unscale then convert to points
            ];

            form.append('payload', JSON.stringify({ page_number: params.pageNumber, region: tabulaRegion }));
            return extractTable(form).then((_data) => {
                const t = zip(...Object.values(_data.payload.table)).map((i) => i.map((j) => (j !== 'nan' ? j : '')));
                dispatch(setTableData({ id, tableData: t }));
                return t;
            });
        },
    );

    const extractionSuccessful = tableData && tableData.length > 0;

    /**
     * Download the table as CSV
     */
    const handleCsvDownload = () => {
        if (hotTableComponentRef.current) {
            const exportPlugin = hotTableComponentRef.current.hotInstance?.getPlugin('exportFile');
            if (!exportPlugin) {
                console.error('no download plugin');
                return;
            }
            exportPlugin.downloadFile('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                fileExtension: 'csv',
                filename: 'extracted_table',
                mimeType: 'text/csv',
                rowDelimiter: '\r\n',
            });
        }
    };

    return {
        isLoading,
        extractionSuccessful,

        handleCsvDownload,
    };
};
export default useExtractionModal;
