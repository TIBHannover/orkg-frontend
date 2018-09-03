import React, {Component} from 'react';
import './StatementsCard.css';

export default class StatementsCard extends Component {

    render() {
        return <div className="statementGroupView">
            <div className="statementGroupView-property">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView">
                    {this.props.children}
                </div>
            </div>
        </div>
    }

}