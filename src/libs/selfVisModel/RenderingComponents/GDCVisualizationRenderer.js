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

    return (
        <div>
            <Chart
                chartType={props.model.data.visMethod}
                data={props.model.data.googleChartsData}
                // width={this.state.windowWidth - 20 + 'px'}
                // height={this.state.windowHeight + 'px'}
                options={{
                    showRowNumber: true,
                    width: '100%',
                    ...(props.height ? { height: props.height } : {})
                }}
            />
        </div>
    );
};

GDCVisualizationRenderer.propTypes = {
    model: PropTypes.any,
    height: PropTypes.string
};

export default GDCVisualizationRenderer;
