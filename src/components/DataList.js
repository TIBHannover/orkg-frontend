import React, {Component} from 'react';
import DataRow from './DataRow';

class DataList extends Component {
    render() {
        const data = this.props.data;
        const content = data.map(
            (value, index) => <DataRow key={index} data={value}/>
        );

        if (content.length === 0) {
            return null;
        }

        return (
            <ul>
                {content}
            </ul>
        );
    }
}

export default DataList;