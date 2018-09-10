import React, {Component} from 'react';
import './ShortRecord.css';

export default class Statement extends Component {

    render() {
        return <div className="shortRecord">
            <div className="shortRecord-header">{this.props.header}</div>
            <div className="shortRecord-content">{this.props.children}</div>
        </div>
    }

}