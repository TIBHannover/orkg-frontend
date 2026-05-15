import html2canvas from 'html2canvas-pro';
import { sumBy } from 'lodash';

const generatePdf = async (id: string) => {
    const table = document.getElementById(id);
    const header = table?.querySelector('thead > tr') as HTMLElement | null;
    const allRows = Array.from((table?.querySelectorAll('tbody > tr') as NodeListOf<HTMLElement>) ?? []);
    if (!header || allRows.length === 0) {
        throw new Error('Unable to find the comparison table to export');
    }
    const headerHeightMm = header.offsetHeight;
    const headerWidthMm = header.offsetWidth;
    const bodyHeightMm = sumBy(allRows, 'offsetHeight');

    // Header
    const canvasHeader = await html2canvas(header);
    const imgData = canvasHeader.toDataURL('image/png');
    // jspdf is a large package, dynamically import it for code splitting
    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
        orientation: 'l',
        unit: 'px',
        format: [headerHeightMm + bodyHeightMm + 10, headerWidthMm + 10],
        hotfixes: ['px_scaling'],
    });
    pdf.addImage(imgData, 'PNG', 5, 5, 0, 0);

    // Body
    const promises = allRows.map((row) => html2canvas(row));
    const allCanvasRows = await Promise.all(promises);
    allCanvasRows.map((can, i) => {
        const imgData2 = can.toDataURL('image/png');
        return pdf.addImage(imgData2, 'PNG', 5, headerHeightMm + sumBy(allRows.slice(0, i), 'offsetHeight'), 0, 0);
    });

    pdf.save('ORKG Comparison exported.pdf');
};

export default generatePdf;
