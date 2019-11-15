import React, { Component } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';

// FIXME: svg icons look ugly while exporting, so hide them before generating the PDF
// TODO: currently the PDF file has dimensions based on the table, it is better to
// have A4 landscape dimensions and fit the table by resizing it
class GeneratePdf extends Component {
    render() {
        return (
            <DropdownItem
                onClick={() => {
                    const input = document.getElementById(this.props.id);
                    const inputHeightMm = input.offsetHeight;
                    const inputWidthMm = input.offsetWidth;

                    html2canvas(input).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');

                        let pdf = new jsPDF('l', 'mm', [inputHeightMm, inputWidthMm]);
                        pdf.addImage(imgData, 'PNG', 0, 5);
                        pdf.save('ORKG Comparison exported.pdf');
                    });
                }}
            >
                Export as PDF
            </DropdownItem>
        );
    }
}

GeneratePdf.propTypes = {
    id: PropTypes.string.isRequired
};

export default GeneratePdf;
