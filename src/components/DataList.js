import React, {Component} from 'react';
import DataRow from './DataRow';
import {hashCode} from '../helpers.js';

class DataList extends Component {
    render() {
        const data = this.props.data;

        if (!data || data.length === 0) {
            return null;
        }

        if (!this.props.allResources) {
            console.error('DataList. allResources is not specified.');
            return null;
        }

        const that = this;
        const content = data.map((value, index) => {
            const predicate = value.predicateId && (index === 0 || data[index - 1].predicateId !== value.predicateId)
                    ? that.props.allPredicates.find(predicate => predicate.id === value.predicateId).label : null;
            /*
             * List key should be based on the ID of the connection, for the top connections we use the ID's of the
             * resources or the hash values of the literals.
             */
            const key = value.statementId ?
                    's_' + value.statementId :
                    (value.resource ? value.resource.id : hashCode(value.literal));
            const row = (value.literal) ? <li>&quot;{value.literal}&quot;</li>
                    : <DataRow data={value.resource} allResources={that.props.allResources}
                    allPredicates={that.props.allPredicates} level={that.props.level}/>;
            return <span key={key}>
                <strong>{predicate}</strong>
                {row}
            </span>
        });

        return (
            <ul>
                {content}
            </ul>
        );
    }
}

export default DataList;