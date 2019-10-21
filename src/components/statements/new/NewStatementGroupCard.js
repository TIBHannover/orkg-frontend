import React, { Component } from 'react';
import NewStatementObject from '../NewStatementObject';
import PropTypes from 'prop-types';

class NewStatementGroupCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            newStatementVisible: false,
        };
    }

    onAddValueClick = () => {
        this.setState({ newStatementVisible: true });
    };

    onCancelAddValueClick = () => {
        this.setState({ newStatementVisible: false });
    };

    handlePublishSuccess = async (newRecordLabel) => {
        this.setState({ newStatementVisible: false });
        await this.props.onUpdate(newRecordLabel);
    };

    onCancelClick = (event) => {
        event.cardId = this.props.id;
        this.props.onCancelClick(event);
    };

    render() {
        return (
            <div className="statementGroupView new">
                <div className="statementGroupView-property edit">
                    <div className="statementGroupView-property-label" />
                </div>
                <div className="statementListView">
                    <div className="statementListView-listView" ref="innerListView">
                        <NewStatementObject
                            subjectId={this.props.subjectId}
                            predicate={null}
                            onCancelClick={this.onCancelClick}
                            onPublishSuccess={this.handlePublishSuccess}
                        />
                    </div>
                </div>
            </div>
        )
    }

}


NewStatementGroupCard.propTypes = {
    id: PropTypes.number.isRequired,
    subjectId: PropTypes.string.isRequired,
    onCancelClick: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default NewStatementGroupCard;