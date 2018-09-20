import React, {Component} from 'react';
import NewStatement from "../NewStatement";
import AddValueToolbar from "../AddValueToolbar";
import Statement from "../Statement";

export default class NewStatementGroupCard extends Component {

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
        return <div className="statementGroupView">
            <div className="statementGroupView-property edit">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView" ref="innerListView">
                    {this.state.newStatementVisible
                            && <NewStatement subjectId={null} predicateId={null}
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