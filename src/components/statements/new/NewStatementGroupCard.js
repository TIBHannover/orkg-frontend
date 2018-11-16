import React, {Component} from 'react';
import NewStatementObject from '../NewStatementObject';

export default class NewStatementGroupCard extends Component {

    state = {
        newStatementVisible: false,
    };

    componentDidMount() {
        this.id = this.props.id;
    }

    onAddValueClick = () => {
        this.setState({newStatementVisible: true});
    };

    onCancelAddValueClick = () => {
        this.setState({newStatementVisible: false});
    };

    onPublishSuccess = (newRecordLabel) => {
        this.setState({newStatementVisible: false});
        this.props.onUpdate(newRecordLabel);
    };

    onCancelClick = (event) => {
        event.cardId = this.id;
        this.props.onCancelClick(event);
    };

    render() {
        return <div className="statementGroupView new">
            <div className="statementGroupView-property edit">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView" ref="innerListView">
                    <NewStatementObject subjectId={this.props.subjectId} predicate={null}
                            onCancelClick={this.onCancelClick}
                            onPublishSuccess={this.onPublishSuccess}/>
                </div>
            </div>
        </div>
    }

}
