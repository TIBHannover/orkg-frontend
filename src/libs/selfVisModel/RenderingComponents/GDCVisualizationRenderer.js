import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import { GoogleCharts } from 'google-charts';

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

    // const chartEvents = [
    //     {
    //         eventName: 'ready',
    //         callback({ chartWrapper }) {
    //             props.chartWrapperFunction(chartWrapper.getChart());
    //         },
    //     },
    // ];

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
        // console.log(wrapper.getChart());
        GoogleCharts.api.visualization.events.addListener(wrapper, 'ready', () => console.log('ready'));
        // GoogleCharts.api.visualization.events.addListener(wrapper.getChart(), 'ready', () => console.log('test'));

        // GoogleCharts.api.visualization.events.addListener(wrapper, 'ready', () => {
        //     // console.log(wrapper);
        //     // console.log(obj);
        //     console.log('test');
        //     // props.chartWrapperFunction(wrapper.getChart());
        //     // console.log(wrapper.getChart());
        //     // console.log('properties passed');
        // });
        // props.chartWrapperFunction(wrapper.getChart());
    }
    // console.log('reloaded');
    return (
        <>
            <div
                id="google-chart-rendered"
                style={{
                    // height: props.height,
                    width: '1000px',
                    height: '500px',
                    // position: 'absolute',
                    // opacity: 0,
                    pointerEvents: 'none',
                }}
            />
            {/* <Chart
                chartType={props.model.data.visMethod}
                data={props.model.data.googleChartsData}
                height={props.height ?? undefined}
                width={props.width ?? '100%'}
                options={{
                    showRowNumber: true,
                    enableInteractivity: !props.disableInteractivity,

                    ...(props.height ? { height: props.height } : {}),
                }}
            /> */}
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
