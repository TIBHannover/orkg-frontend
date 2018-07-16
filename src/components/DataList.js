import React, {Component} from 'react';
import DataRow from './DataRow';
import {submitGetRequest, url} from '../helpers.js';

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
                    ? (that.props.allPredicates.find(predicate => predicate.id === value.predicateId).label) : null;
            return <span>
                {predicate}
                <DataRow key={value.id} data={value.resource}
                        allResources={that.props.allResources} allPredicates={that.props.allPredicates}
                        level={that.props.level}/>
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