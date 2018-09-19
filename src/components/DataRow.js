import React, {Component} from 'react';
import DataList from './DataList';
import AddConnectedResourceModal from './AddConnectedResourceModal';

class DataRow extends Component {

    constructor(props) {
        super(props);

        this.url = 'http://localhost:8000/api/statements/';

        this.state = {
        };

        this.setState = this.setState.bind(this);
        this.findConnections = this.findConnections.bind(this);
    }

    findConnections(subjectId) {
        const that = this;

        this.setState({
            connections: [],
        });

        fetch(this.url, {
            method: 'GET',
        })
        .then((response) => {
            console.log('Response type: ' + response.type);
            return response.json();
        })
        .then((responseJson) => {
            const connections = responseJson
                    .filter(item => item.subject === subjectId)
                    .map(connection => {
                        switch (connection.object.type) {
                            case 'resource': {
                                const resource = that.props.allResources.find(res => res.id === connection.object.id);
                                return {
                                    statementId: connection.statementId,
                                    predicateId: connection.predicate,
                                    resource: resource,
                                }
                            }
                            case 'literal': {
                                return {
                                    statementId: connection.statementId,
                                    predicateId: connection.predicate,
                                    literal: connection.object.value
                                }
                            }
                        }
                    });
            that.setState({
                connections: connections,
            });
        })
        .catch((err) => {
            console.error(err);
            that.setState({
                error: err.message,
            });
        });
    }

    render() {
        /* Name of the ID property. */
        const idPropertyName = 'id';

        /* Name of the property that should be displayed as text. */
        const displayPropertyName = 'label';

        const data = this.props.data;

        if (!this.state.connections) {
            this.findConnections(data[idPropertyName]);
        }

        if (!data) {
            return null;
        }

        /* Here we limit the number of nested levels. */
        return <li>
            <a href={window.location.origin + '/#id=' + data[idPropertyName]}>{data[displayPropertyName]}</a>&nbsp;
            <AddConnectedResourceModal allPredicates={this.props.allPredicates} allResources={this.props.allResources}
                    subjectId={data[idPropertyName]} subjectLabel={data[displayPropertyName]}/>
            <br/>
            {this.props.level <= 2 ? <DataList data={this.state.connections}
                    allResources={this.props.allResources} allPredicates={this.props.allPredicates}
                    level={this.props.level + 1}/> : null}
        </li>
    }

}

export default DataRow;