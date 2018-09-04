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
                <span className="toolbar-wrapper">
                    <div className="toolbar toolbar-container addToolbar">
                        <span className="toolbar-button toolbar-button-add">
                            <a href="#" title="Add a new value">
                                <span className="fa fa-plus" aria-hidden="true"/>
                                add value
                            </a>
                        </span>
                    </div>
                </span>
            </div>
        </div>
    }

}