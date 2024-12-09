import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import html2canvas from 'html2canvas';
import { sumBy } from 'lodash';
import { FC, useState } from 'react';
import { DropdownItem } from 'reactstrap';

// FIXME: svg icons look ugly while exporting, so hide them before generating the PDF
// TODO: currently the PDF file has dimensions based on the table, it is better to
// have A4 landscape dimensions and fit the table by resizing it
type GeneratePdfProps = {
    id: string;
};

const GeneratePdf: FC<GeneratePdfProps> = ({ id }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        const header = document.getElementById(id)?.getElementsByClassName('header')[0] as HTMLElement;
        const headerHeightMm = header?.offsetHeight;
        const headerWidthMm = header?.offsetWidth;
        const allRows = Array.from((document.getElementById(id)?.getElementsByClassName('comparisonRow') as HTMLCollectionOf<HTMLElement>) ?? []);
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
        setIsLoading(false);
    };

    return (
        <DropdownItem onClick={handleExport} disabled={isLoading} toggle={false}>
            Export as PDF {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
        </DropdownItem>
    );
};

export default GeneratePdf;
