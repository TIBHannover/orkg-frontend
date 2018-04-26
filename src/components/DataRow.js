import React, {Component} from 'react';
import DataList from './DataList';

class DataRow extends Component {
    render() {
        /* Name of the ID property. */
        const idPropertyName = 'id';

        /* Name of the property that should be displayed as text. */
        const displayPropertyName = 'label';

        /* Hidden properties. */
        const ignoredProperties = [idPropertyName, displayPropertyName];

        const data = this.props.data;

        if (!data) {
            return null;
        }

        return <li>{data[displayPropertyName]}</li>
    }
}

export default DataRow;