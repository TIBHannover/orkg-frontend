import { jsPDF } from 'jspdf';

export const downloadJPG = (chart, imageTitle) => {
    let img = new Image();
    img.addEventListener('load', () => {
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        let link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg');
        link.download = `${imageTitle}.jpg`;

        link.click();
    });
    img.src = chart.getImageURI();
};

export const downloadPDF = (chart, fileName) => {
    let img = new Image();
    img.addEventListener('load', () => {
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        let imgData = canvas.toDataURL('image/jpeg');

        // window.jsPDF = window.jspdf.jsPDF;
        // window.jsPDF = require('jspdf');
        let pdf = new jsPDF();

        pdf.addImage(imgData, 'JPEG', 10, 10);
        pdf.save(`${fileName}.pdf`);
    });
    img.src = chart.getImageURI();
};

// From svg node

export const downloadSVG = (svg, imageTitle) => {
    let rects = svg.querySelectorAll('rect');
    rects.forEach(element => {
        if (element.getAttribute('fill') === '#ffffff') element.setAttribute('fill', 'transparent');
    });

    let textSVG = new XMLSerializer().serializeToString(svg);
    let element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(textSVG)}`);
    element.setAttribute('download', `${imageTitle}.svg`);

    element.style.display = 'none';
    element.click();

    rects.forEach(element => {
        if (element.getAttribute('fill') === 'transparent') element.setAttribute('fill', '#ffffff');
    });
};

export const downloadPNG = (svg, imageTitle) => {
    // svg letiable is the svg tag from which we want to get an PNG
    let rects = svg.querySelectorAll('rect');
    rects.forEach(element => {
        if (element.getAttribute('fill') === '#ffffff') element.setAttribute('fill', 'transparent');
    });

    let textSvg = new XMLSerializer().serializeToString(svg);
    textSvg = `<?xml version="1.0"?>\n ${textSvg}`;
    let imgsrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(textSvg)))}`;
    let img = new Image();
    img.src = imgsrc;
    img.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, img.width, img.height);

        ctx.drawImage(img, 0, 0);
        let link = document.createElement('a');
        link.download = `${imageTitle}.png`;
        link.href = canvas.toDataURL('image/png');
        // console.log(imageTitle);
        link.click();
    };

    rects.forEach(element => {
        if (element.getAttribute('fill') === 'transparent') element.setAttribute('fill', '#ffffff');
    });
};
