import React, {Component} from 'react';
import DataRow from './DataRow';
import {GetRequester, url} from '../helpers.js';

class DataList extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    findPredicateNames(predicateIds) {
        GetRequester();
    }

    render() {
        const data = this.props.data;

        if (!data || data.length === 0) {
            return null;
        }

        if (!this.props.allResources) {
            console.error('DataList. allResources is not specified.');
            return null;
        }

        const predicateIds = data.map(value => value.predicateId);

        const content = data.map(
            (value, index) => <span>
                    {value.predicateId && (index === 0 || data[index - 1].predicateId !== value.predicateId)
                            ? value.predicateId : null}
                    <DataRow key={value.id} data={value.resource}
                            allResources={this.props.allResources} level={this.props.level}/>
            </span>
        );

        return (
            <ul>
                {content}
            </ul>
        );
    }
}

export default DataList;