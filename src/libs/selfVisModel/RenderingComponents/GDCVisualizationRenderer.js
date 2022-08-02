import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import { GoogleCharts } from 'google-charts';
import { useEffect } from 'react';

const GDCVisualizationRenderer = props => {
    // adding pre-processing step to render date items correctly;

    // this replace the date string with a new Date() obj
    // no need to create new model, it is directly updated as reference
    const strModel = props.model.data.googleChartsData;
    strModel.cols.forEach((item, index) => {
        if (item.type === 'date') {
            strModel.rows.forEach(rowItem => {
                const dateItem = rowItem.c[index];
                dateItem.v = new Date(dateItem.v); // overwrite the date item
            });
        }
    });

    const chartEvents = [
        {
            eventName: 'ready',
            callback({ chartWrapper }) {
                console.log('ready');
                props.downloadChart(chartWrapper.getChart());
            },
        },
    ];

    return (
        <>
            <Chart
                chartType={props.model.data.visMethod}
                data={props.model.data.googleChartsData}
                height={props.height ?? undefined}
                width={props.width ?? '100%'}
                options={{
                    title: props.caption ?? undefined,
                    showRowNumber: true,
                    enableInteractivity: !props.disableInteractivity,
                    ...(props.height ? { height: props.height } : {}),
                }}
                chartEvents={props.downloadChart ? chartEvents : undefined}
            />
        </>
    );
};

GDCVisualizationRenderer.propTypes = {
    model: PropTypes.any,
    height: PropTypes.string,
    width: PropTypes.string,
    caption: PropTypes.string,
    downloadChart: PropTypes.func,
    disableInteractivity: PropTypes.bool,
};

export default GDCVisualizationRenderer;
