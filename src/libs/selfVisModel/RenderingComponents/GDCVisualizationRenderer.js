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

    useEffect(() => {
        GoogleCharts.load(drawChart);

        let wrapper;
        function drawChart() {
            // Standard google charts functionality is available as GoogleCharts.api after load
            wrapper = new GoogleCharts.api.visualization.ChartWrapper({
                chartType: props.model.data.visMethod,
                dataTable: props.model.data.googleChartsData,
                containerId: 'google-chart-rendered',
            });
            wrapper.draw();
            // GoogleCharts.api.visualization.events.addListener(wrapper, 'ready', () => console.log('ready'));
            // GoogleCharts.api.visualization.events.addListener(wrapper.getChart(), 'ready', () => console.log('test'));

            setTimeout(() => {
                props.chartWrapperFunction(wrapper.getChart());
            }, 3000);
        }
    }, []);

    return (
        <>
            <div
                id="google-chart-rendered"
                style={{
                    width: '1000px',
                    height: '500px',
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                }}
            />
            <Chart
                chartType={props.model.data.visMethod}
                data={props.model.data.googleChartsData}
                height={props.height ?? undefined}
                width={props.width ?? '100%'}
                options={{
                    showRowNumber: true,
                    enableInteractivity: !props.disableInteractivity,
                    ...(props.height ? { height: props.height } : {}),
                }}
            />
        </>
    );
};

GDCVisualizationRenderer.propTypes = {
    model: PropTypes.any,
    height: PropTypes.string,
    width: PropTypes.string,
    disableInteractivity: PropTypes.bool,
    chartWrapperFunction: PropTypes.func,
};

export default GDCVisualizationRenderer;
