import React from 'react';

export default class DataForChart {
    constructor() {
        this.header = [];
        this.rowls = [];

        this.addColumn = this.addColumn.bind(this);
        this.addRow = this.addRow.bind(this);
        this.getChartData = this.getChartData.bind(this);
    }

    useAllColumns = () => {
        return {
            cols: this.header,
            rows: this.rowls
        };
    };

    createDataFromXYSelectors = (xSelector, ySelectors) => {
        const oldHeaders = this.header;
        // create headers;
        let xSelectorIndex;
        const ySelectorIndices = [];
        const newHeaders = [];
        oldHeaders.forEach((oh, index) => {
            if (oh.label === xSelector) {
                xSelectorIndex = index;
                newHeaders.push(this.header[index]);
            }
            if (ySelectors.indexOf(oh.label) !== -1) {
                ySelectorIndices.push(index);
                newHeaders.push(this.header[index]);
            }
        });

        // reconstruct the data
        if (newHeaders.length >= 4) {
            newHeaders[2].role = 'interval';
            newHeaders[3].role = 'interval';
        }

        const newRows = [];

        // fetch the data from the table itself;
        this.rowls.forEach(row => {
            const newR = [];
            newR.push(row.c[xSelectorIndex].v);
            for (let i = 0; i < ySelectorIndices.length; i++) {
                newR.push(row.c[ySelectorIndices[i]].v);
            }

            // remainingData is not used for now;
            this.addRow2(newRows, ...newR);
        });

        console.log('Headers/ ', newHeaders);
        return {
            cols: newHeaders,
            rows: newRows
        };
    };

    updateXYAxisSelectors = (xSelector, ySelector) => {
        const oldHeaders = this.header;
        // whats the index in the  oldHeaders;
        let firstIndex;
        let secondIndex;
        oldHeaders.forEach((oh, index) => {
            if (oh.label === xSelector) {
                firstIndex = index;
            }
            if (oh.label === ySelector) {
                secondIndex = index;
            }
        });
        // console.log('First index', firstIndex, 'secondIndex', secondIndex);

        // build new data structure;
        const newHeaders = [];
        newHeaders.push(this.header[firstIndex]);
        newHeaders.push(this.header[secondIndex]);

        const newRows = [];

        // fetch the data from the table itself;
        this.rowls.forEach(row => {
            const newR = [];
            newR.push(row.c[firstIndex].v);
            newR.push(row.c[secondIndex].v);
            // remainingData is not used for now;
            this.addRow2(newRows, ...newR);
        });

        return {
            cols: newHeaders,
            rows: newRows
        };
    };

    addColumn() {
        if (arguments.length === 2) {
            const first = arguments[0];
            const second = arguments[1];

            // console.log(first + ' ' + second);
            const col = { type: first, label: second };
            this.header.push(col);
        }
        if (arguments.length === 1) {
            this.header.push(arguments[0]);
        }
    }

    addRow2(target) {
        const rowObject = [];
        for (let i = 1; i < arguments.length; i++) {
            const valObject = { v: arguments[i] };
            rowObject.push(valObject);
        }
        const toPush = { c: rowObject };
        target.push(toPush);
    }

    addRow() {
        const rowObject = [];
        for (let i = 0; i < arguments.length; i++) {
            const valObject = { v: arguments[i] };
            rowObject.push(valObject);
        }
        const toPush = { c: rowObject };
        this.rowls.push(toPush);
    }

    getChartData() {
        return {
            cols: this.header,
            rows: this.rowls
        };
    }
}
