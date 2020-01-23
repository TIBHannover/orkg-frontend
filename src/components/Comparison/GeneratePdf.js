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
                    const header = document.getElementById(this.props.id).getElementsByClassName('rt-thead')[0];
                    const headerHeightMm = header.offsetHeight;
                    const headerWidthMm = header.offsetWidth;
                    const body = document.getElementById(this.props.id).getElementsByClassName('rt-tbody')[0];
                    const bodyHeightMm = body.offsetHeight;
                    // Header
                    html2canvas(header).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('l', 'mm', [headerHeightMm + bodyHeightMm, headerWidthMm]);
                        pdf.addImage(imgData, 'PNG', 0, 5);
                        // Body
                        html2canvas(body).then(canvas => {
                            const imgData2 = canvas.toDataURL('image/png');
                            // multiply by 0.26 to convert from pixel to mm
                            pdf.addImage(imgData2, 'PNG', 0, headerHeightMm * 0.26 + 5);
                            pdf.save('ORKG Comparison exported.pdf');
                        });
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
