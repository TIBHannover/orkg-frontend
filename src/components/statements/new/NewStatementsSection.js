import React, {Component, Fragment} from 'react';
import NewStatementGroupCard from './NewStatementGroupCard';
import AddStatementButton from './AddStatementButton';

export default class NewStatementsSection extends Component {

    state = {
        newStatementBoxes: [],
    };

    counter = 0;

    reset = () => {
        this.forceUpdate();
    };

    onAddNewStatementClick = () => {
        this.state.newStatementBoxes.push({
            id: this.counter,
            card: <NewStatementGroupCard id={this.counter} key={this.counter} onUpdate={this.props.onUpdate}
                subjectId={this.props.subjectId}
                onCancelClick={this.onCancelClick}/>
        });
        this.counter++;
        this.forceUpdate();
        return false;
    };

    onCancelClick = (event) => {
        const newStatementBoxes = this.state.newStatementBoxes.filter((statementBox) => {
            return statementBox.id !== event.cardId;
        });
        this.setState({newStatementBoxes: newStatementBoxes});
        return false;
    };

    render () {
        const addStatementLinkJsx = <AddStatementButton onClick={this.onAddNewStatementClick}/>;
        const newStatementBoxes = this.state.newStatementBoxes.map((statementBox) => statementBox.card);

        return <Fragment>
            {newStatementBoxes}
            {addStatementLinkJsx}
        </Fragment>
    }

}
