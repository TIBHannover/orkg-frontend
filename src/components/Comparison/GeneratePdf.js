import React from 'react';
// There is an issue in the main package (Unhandled Rejection (TypeError): setting getter-only property "className")
import html2canvas from '@trainiac/html2canvas';
import { DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';

// FIXME: svg icons look ugly while exporting, so hide them before generating the PDF
// TODO: currently the PDF file has dimensions based on the table, it is better to
// have A4 landscape dimensions and fit the table by resizing it
const GeneratePdf = props => {
    const handleExport = async () => {
        const header = document.getElementById(props.id).getElementsByClassName('comparison-thead')[0];
        const headerHeightMm = header.offsetHeight;
        const headerWidthMm = header.offsetWidth;
        let body = document.getElementById(props.id).getElementsByClassName('rt-tbody')[0];
        const bodyHeightMm = body.offsetHeight;

        // Header
        const canvasHeader = await html2canvas(header);
        const imgData = canvasHeader.toDataURL('image/png');
        // jspdf is a large package, dynamically import it for code splitting
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF('l', 'mm', [headerHeightMm + bodyHeightMm, headerWidthMm]);
        pdf.addImage(imgData, 'PNG', 0, 5);

        // Body
        // There is issue (Unable to find element in cloned iframe) if we don't select the body again!
        body = document.getElementById(props.id).getElementsByClassName('rt-tbody')[0];
        const canvas = await html2canvas(body);
        const imgData2 = canvas.toDataURL('image/png');
        // multiply by 0.26 to convert from pixel to mm
        pdf.addImage(imgData2, 'PNG', 0, headerHeightMm * 0.26 + 5);
        pdf.save('ORKG Comparison exported.pdf');
    };

    return <DropdownItem onClick={handleExport}>Export as PDF</DropdownItem>;
};

GeneratePdf.propTypes = {
    id: PropTypes.string.isRequired
};

export default GeneratePdf;
