import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { getStatementsBySubject } from '../../../services/backend/statements';
import SingleVisualizationComponent from './SingleVisualizationComponent';
import { CLASSES, PREDICATES } from '../../../constants/graphSettings';
import PreviewCarouselComponent from './PreviewCarousel';
import { getVisualization } from 'services/similarity/index';

export default class PreviewComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMetaData: false,
            loadingFinished: false,
            numberOfVis: 0,
            activeItemIndex: 0,
            visData: []
        };
    }

    componentDidMount = () => {
        this.fetchData().then();
    };

    componentDidUpdate = prevProps => {
        if (prevProps.comparisonId !== this.props.comparisonId || prevProps.reloadingFlag !== this.props.reloadingFlag) {
            this.fetchData().then();
        }
    };

    getDescription = async id => {
        let description = 'empty';
        const provInfo = await getStatementsBySubject({ id: id });
        const descriptionStatement = provInfo.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);

        if (descriptionStatement && descriptionStatement.object) {
            description = descriptionStatement.object.label;
        }
        return description;
    };
    getModel = async id => {
        return await getVisualization(id);
    };

    fetchData = async () => {
        const visDataArray = [];

        const comparisonStatements = await getStatementsBySubject({ id: this.props.comparisonId });
        const metaStatements = comparisonStatements.filter(
            statement => statement.object.classes && statement.object.classes.includes(CLASSES.VISUALIZATION_DEFINITION)
        );
        const that = this;
        const animationWaiter = new Promise(async function(resolve) {
            for (let i = 0; i < metaStatements.length; i++) {
                const metaState = metaStatements[i];
                const metaNodeId = metaState.object.id;
                const title = metaState.object.label ?? '';
                const description = await that.getDescription(metaNodeId);

                const model = await that.getModel(metaNodeId);

                if (model.data) {
                    // create visualization object only when this exists;
                    const visDataObject = {
                        title: title,
                        description: description,
                        reconstructionModel: model
                    };
                    visDataArray.push(visDataObject);
                }
            }
            resolve();
        });
        await animationWaiter.then(() => {
            this.setState({
                hasMetaData: true,
                numberOfVis: visDataArray.length,
                visData: visDataArray,
                loadingFinished: true
            });
        });
    };

    onChange = value => this.setState({ activeItemIndex: value });
    createVisualizations = () => {
        // gets from the state the visualizations;
        if (this.state.loadingFinished) {
            const mappedData = this.state.visData.map((data, index) => {
                return (
                    <SingleVisualizationComponent
                        key={'singleVisComp_' + index}
                        input={data}
                        itemIndex={index}
                        propagateClick={this.props.propagateClick}
                    />
                );
            });
            if (mappedData && mappedData.length > 0) {
                return <PreviewCarouselComponent reloadingSizeFlag={this.props.reloadingSizeFlag}> {mappedData}</PreviewCarouselComponent>;
            } else {
                return <></>;
            }
        }
    };

    /** component rendering entrance point **/
    render() {
        return <>{this.state.hasMetaData && <div>{this.createVisualizations()}</div>}</>;
    }
}

PreviewComponent.propTypes = {
    comparisonId: PropTypes.string,
    reloadingFlag: PropTypes.bool,
    reloadingSizeFlag: PropTypes.bool,
    propagateClick: PropTypes.func
};
