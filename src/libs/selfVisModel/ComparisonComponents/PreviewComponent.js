import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { getStatementsBySubject } from '../../../services/backend/statements';
import SingleVisualizationComponent from './SingleVisualizationComponent';
import ItemsCarousel from 'react-items-carousel';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';

export default class PreviewComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMetaData: false,
            numberOfVis: 0,
            visData: []
        };
    }

    componentDidMount = () => {
        this.fetchData();
    };

    componentDidUpdate = prevProps => {
        if (prevProps.comparisonId !== this.props.comparisonId || prevProps.reloadingFlag !== this.props.reloadingFlag) {
            console.log('RELOADING DATA >>>>>>>>>> FORCED ');
            this.fetchData();
        }
    };

    fetchData = () => {
        getStatementsBySubject({ id: this.props.comparisonId }).then(comparisionStatements => {
            const metaStatements = comparisionStatements.find(statement => statement.object.classes && statement.object.classes.includes('C11019'));
            if (metaStatements) {
                const metaNodeId = metaStatements.object.id;
                getStatementsBySubject({ id: metaNodeId }).then(metaInformationStatements => {
                    const visData = [];
                    metaInformationStatements.forEach(mis => {
                        visData.push(JSON.parse(mis.object.label));
                    });
                    if (visData.length > 0) {
                        this.setState({
                            hasMetaData: true,
                            numberOfVis: visData.length,
                            visData: visData
                        });
                    }
                });
            }
        });
    };

    createVisualizations = () => {
        // gets from the state the visualizations;

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
        return <div style={{ display: 'flex' }}> {mappedData}</div>;
    };

    /** component rendering entrance point **/
    render() {
        return <>{this.state.hasMetaData && <div>{this.createVisualizations()}</div>}</>;
    }
}

PreviewComponent.propTypes = {
    comparisonId: PropTypes.string,
    reloadingFlag: PropTypes.bool,
    propagateClick: PropTypes.func
};
