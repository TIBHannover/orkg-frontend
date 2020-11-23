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

    createDataFromSelectors = state => {
        const oldHeaders = this.header;
        // create headers;
        let xSelectorIndex;
        const ySelectorIndices = [];
        const newHeaders = [];

        const headerMap = {};
        oldHeaders.forEach((oh, index) => {
            headerMap[oh.label] = index;
        });

        if (headerMap[state.xAxis] !== undefined) {
            newHeaders.push(oldHeaders[headerMap[state.xAxis]]);
            xSelectorIndex = headerMap[state.xAxis];
        }

        state.yAxis.forEach((yax, yaxID) => {
            // find yAx in headerMap;
            if (headerMap[yax]) {
                newHeaders.push(oldHeaders[headerMap[yax]]);
                ySelectorIndices.push(headerMap[yax]);
                if (state.yAxisIntervals && state.yAxisIntervals[yaxID]) {
                    const intervals = state.yAxisIntervals[yaxID];
                    intervals.forEach((int, i) => {
                        const i_label = int.label;

                        // if we have such an interval label
                        if (headerMap[i_label] !== undefined) {
                            newHeaders.push({ id: 'i' + i, type: 'number', role: 'interval' });
                            ySelectorIndices.push(headerMap[i_label]);
                        }
                    });
                }
            }
        });

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
