import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

const GDCVisualizationRenderer = props => {
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
