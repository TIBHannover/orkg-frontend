import React, {Component} from 'react';
import DataList from './DataList';
import {Button, Container, Form, Modal, Icon, Segment, Grid, TextArea, Input, Label} from 'semantic-ui-react';

class DataRow extends Component {

    constructor(props) {
        super(props);

        this.url = 'http://localhost:8000/api/statements/';

        this.state = {
        }

        this.findConnections = this.findConnections.bind(this);
    }

    findConnections(subjectId) {
        const that = this;

        this.state.connections = [];

        fetch(this.url, {
                    method: 'GET',
                })
                .then((response) => {
                    console.log('Response type: ' + response.type);
                    return response.json();
                })
                .then((responseJson) => {
                    const conn = responseJson.filter(item => item.subject === subjectId);
                    const connections = conn.map(item => {
                        return {
                            predicateId: item.predicate,
                            objectId: item.object.id
                        }
                    });
                    const connectionObjectIds = connections.map(connection => connection.objectId);
                    const connectedResources = that.props.allResources.filter(
                            item => connectionObjectIds.includes(item.id)).
                            map(item => {
                                return {
                                    predicateId: conn.find(connItem => connItem.object.id === item.id).predicate,
                                    resource: item
                                }
                            });
                    that.setState({
                        connections: connectedResources,
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

        /* Hidden properties. */
        const ignoredProperties = [idPropertyName, displayPropertyName];

        const data = this.props.data;

        if (!this.state.connections) {
            this.findConnections(data[idPropertyName]);
        }

        if (!data) {
            return null;
        }

        /* Here we limit the number of nested levels. */
        return <li>
            <a href={window.location.origin + '/#id=' + data[idPropertyName]}>{data[displayPropertyName]}</a><br/>
            {this.props.level <= 2 ? <DataList data={this.state.connections}
                    allResources={this.props.allResources} level={this.props.level + 1}/> : null}
        </li>
    }

}

export default DataRow;