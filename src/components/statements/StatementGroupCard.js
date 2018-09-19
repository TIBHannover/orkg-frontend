import React, {Component} from 'react';
import './StatementGroupCard.css';
import NewStatement from "./NewStatement";
import AddValueToolbar from "./AddValueToolbar";
import Statement from "./Statement";

export default class StatementGroupCard extends Component {

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

    onPublishSuccess(newRecordLabel) {
        this.setState({newStatementVisible: false});
        this.props.onUpdate(newRecordLabel);
    }

    render() {
        const statementGroup = this.props.statementGroup;
        const subjectId = statementGroup[0].subject;
        const predicateId = statementGroup[0].predicate;

        const statements = statementGroup.map(
            (statement) => <Statement getText={this.props.getStatementText(statement.object.id)}
                    setText={this.props.setStatementText(statement.object.id)}
                    id={statement.object.id} onUpdate={this.reset}/>);

        return <div className="statementGroupView">
            <div className="statementGroupView-property">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView" ref="innerListView">
                    {statements}
                    {this.state.newStatementVisible
                            && <NewStatement subjectId={subjectId} predicateId={predicateId}
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