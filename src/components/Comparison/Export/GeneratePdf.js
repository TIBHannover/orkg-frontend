import html2canvas from 'html2canvas';
import { DropdownItem } from 'reactstrap';
import { sumBy } from 'lodash';
import PropTypes from 'prop-types';

// FIXME: svg icons look ugly while exporting, so hide them before generating the PDF
// TODO: currently the PDF file has dimensions based on the table, it is better to
// have A4 landscape dimensions and fit the table by resizing it
const GeneratePdf = props => {
    const handleExport = async () => {
        const header = document.getElementById(props.id).getElementsByClassName('header')[0];
        const headerHeightMm = header.offsetHeight;
        const headerWidthMm = header.offsetWidth;
        const allRows = Array.from(document.getElementById(props.id).getElementsByClassName('comparisonRow'));
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
        pdf.addImage(imgData, 'PNG', 5, 5);

        // Body
        const promises = allRows.map(row => html2canvas(row));
        const allCanvasRows = await Promise.all(promises);
        allCanvasRows.map((can, i) => {
            const imgData2 = can.toDataURL('image/png');
            return pdf.addImage(imgData2, 'PNG', 5, headerHeightMm + sumBy(allRows.slice(0, i), 'offsetHeight'));
        });

        pdf.save('ORKG Comparison exported.pdf');
    };

    return <DropdownItem onClick={handleExport}>Export as PDF</DropdownItem>;
};

GeneratePdf.propTypes = {
    id: PropTypes.string.isRequired,
};

export default GeneratePdf;
