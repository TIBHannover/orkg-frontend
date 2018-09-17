import React, {Component} from 'react';
import './StatementsCard.css';
import NewStatement from "./NewStatement";
import AddValueToolbar from "./AddValueToolbar";

export default class StatementsCard extends Component {

    state = {
        newStatementVisible: false,
    };

    constructor() {
        super();
    }

    onAddValueClick() {
        this.setState({newStatementVisible: true});
    }

    onCancelAddValueClick() {
        this.setState({newStatementVisible: false});
    }

    render() {
        return <div className="statementGroupView">
            <div className="statementGroupView-property">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView" ref="innerListView">
                    {this.props.children}
                    {this.state.newStatementVisible
                            && <NewStatement onCancelClick={this.onCancelAddValueClick.bind(this)}/>}
                </div>
                <div className="toolbar-wrapper">
                    <AddValueToolbar onAddValueClick={this.onAddValueClick.bind(this)}/>
                </div>
            </div>
        </div>
    }

}