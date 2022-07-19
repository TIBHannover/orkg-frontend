import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

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
                props.chartWrapperFunction(chartWrapper.getChart());
            },
        },
    ];

    return (
        <div id="google-chart-rendered">
            <Chart
                chartType={props.model.data.visMethod}
                data={props.model.data.googleChartsData}
                height={props.height ?? undefined}
                options={{
                    showRowNumber: true,
                    enableInteractivity: !props.disableInteractivity,
                    width: props.width ?? '100%',
                    ...(props.height ? { height: props.height } : {}),
                }}
                chartEvents={chartEvents}
            />
        </div>
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
