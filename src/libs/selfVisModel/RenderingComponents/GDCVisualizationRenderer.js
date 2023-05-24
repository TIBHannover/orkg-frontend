import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';

export const StyledChart = styled(Chart)`
    & .google-visualization-table > div {
        overflow: hidden !important;
    }
`;

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
                if (props.downloadChart) props.downloadChart(chartWrapper.getChart());
            },
        },
    ];

    const hAxisTitle = props.model.data.reconstructionData?.customizationState?.xAxisLabel ?? '';
    const vAxisTitle = props.model.data.reconstructionData?.customizationState?.yAxisLabel ?? '';

    return (
        <StyledChart
            chartType={props.model.data.visMethod}
            data={props.model.data.googleChartsData}
            height={props.height ?? undefined}
            width={props.width ?? '100%'}
            options={{
                title: props.caption ?? undefined,
                showRowNumber: true,
                enableInteractivity: !props.disableInteractivity,
                ...(props.height ? { height: props.height } : {}),
                hAxis: {
                    title: hAxisTitle,
                },
                vAxis: {
                    title: vAxisTitle,
                },
            }}
            chartEvents={props.downloadChart ? chartEvents : undefined}
        />
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
