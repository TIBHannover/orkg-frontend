import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DropdownItem } from 'reactstrap';

const pxToMm = (px) => {
    return Math.floor(px / document.getElementById('myMm').offsetHeight);
};

const mmToPx = (mm) => {
    return document.getElementById('myMm').offsetHeight * mm;
};

const range = (start, end) => {
    return Array(end - start).join(0).split(0).map(function (val, id) { return id + start });
};

const GeneratePdf = ({ id }) => (
    <div className="tc mb4 mt2">
        {/*
            Getting pixel height in milimeters:
            https://stackoverflow.com/questions/7650413/pixel-to-mm-equation/27111621#27111621
        */}
        <div id="myMm" style={{ height: "1mm" }} />

        <DropdownItem
            onClick={() => {
                const input = document.getElementById(id);
                const inputHeightMm = pxToMm(input.offsetHeight);
                const inputWidthMm = pxToMm(input.offsetWidth);
                const a4WidthMm = 297;
                const a4HeightMm = 210;
                const a4HeightPx = mmToPx(a4HeightMm);
                const numPages = inputHeightMm <= a4HeightMm ? 1 : Math.floor(inputHeightMm / a4HeightMm) + 1;
                console.log({
                    input, inputHeightMm, a4HeightMm, a4HeightPx, numPages, range: range(0, numPages),
                    comp: inputHeightMm <= a4HeightMm, inputHeightPx: input.offsetHeight
                });

                html2canvas(input)
                    .then((canvas) => {
                        const imgData = canvas.toDataURL('image/png');
                        
                        let pdf;
                        // Document of a4WidthMm wide and inputHeightMm high
                        if (inputHeightMm > a4HeightMm) {
                            // elongated a4 (system print dialog will handle page breaks)
                            pdf = new jsPDF('l', 'mm', [inputHeightMm + 16, a4WidthMm]);
                        } else {
                            // standard a4
                            pdf = new jsPDF('l', 'mm');
                        }
                        pdf.addImage(imgData, 'PNG', 0, 0);
                        pdf.save(`${id}.pdf`);
                    });
                ;

            }}
        >
            Export as PDF
        </DropdownItem>
    </div>);

export default GeneratePdf;