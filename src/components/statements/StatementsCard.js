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

        this.onAddValueClick = this.onAddValueClick.bind(this);
        this.onCancelAddValueClick = this.onCancelAddValueClick.bind(this)
        this.onPublishSuccess = this.onPublishSuccess.bind(this)
    }

    onAddValueClick(event) {
        this.setState({newStatementVisible: true});
    }

    onCancelAddValueClick(event) {
        this.setState({newStatementVisible: false});
    }

    onPublishSuccess() {
        this.setState({newStatementVisible: false});
        this.props.onUpdate();
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
                            && <NewStatement subjectId={this.props.subjectId} predicateId={this.props.predicateId}
                                    onCancelClick={this.onCancelAddValueClick}
                                    onPublishSuccess={this.onPublishSuccess}/>}
                </div>
                <div className="toolbar-wrapper">
                    <AddValueToolbar onAddValueClick={this.onAddValueClick}/>
                </div>
            </div>
        </div>
    }

}