import React, {Component} from 'react';
import DataRow from './DataRow';

class DataList extends Component {
    render() {
        const data = this.props.data;

        if (!data || data.length === 0) {
            return null;
        }

        if (!this.props.allResources) {
            console.error('DataList. allResouces is not specified.');
            return null;
        }

        const content = data.map(
            (value, index) => <DataRow key={value.id} data={value} allResources={this.props.allResources} level={this.props.level}/>
        );

        return (
            <ul>
                {content}
            </ul>
        );
    }
}

export default DataList;