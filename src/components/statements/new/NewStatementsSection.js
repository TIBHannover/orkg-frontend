import React, { Component, Fragment } from 'react';
import NewStatementGroupCard from './NewStatementGroupCard';
import AddStatementButton from './AddStatementButton';
import PropTypes from 'prop-types';

class NewStatementsSection extends Component {

    constructor(props) {
        super(props);

        this.state = {
            newStatementBoxes: [],
            counter: 0
        };
    }

    onAddNewStatementClick = () => {
        this.setState({
            newStatementBoxes: [...this.state.newStatementBoxes, {
                id: this.state.counter,
                card: (
                    <NewStatementGroupCard
                        id={this.state.counter}
                        key={this.state.counter}
                        onUpdate={this.props.onUpdate}
                        subjectId={this.props.subjectId}
                        onCancelClick={this.onCancelClick}
                    />)
            }],
            counter: this.state.counter + 1,
        })
        return false;
    };

    onCancelClick = (event) => {
        const newStatementBoxes = this.state.newStatementBoxes.filter((statementBox) => {
            return statementBox.id !== event.cardId;
        });
        this.setState({ newStatementBoxes: newStatementBoxes });
        return false;
    };

    render() {
        const addStatementLinkJsx = <AddStatementButton onClick={this.onAddNewStatementClick} />;
        const newStatementBoxes = this.state.newStatementBoxes.map((statementBox) => statementBox.card);

        return (
            <Fragment>
                {newStatementBoxes}
                {addStatementLinkJsx}
            </Fragment>
        )
    }
}

NewStatementsSection.propTypes = {
    subjectId: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default NewStatementsSection;