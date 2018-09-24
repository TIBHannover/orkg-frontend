import React, {Component} from 'react';
import NewStatementGroupCard from './NewStatementGroupCard';
import AddStatementLink from './AddStatementLink';

export default class NewStatementsSection extends Component {

    state = {
        newStatementBoxes: [],
    };

    counter = 0;

    onAddNewStatementClick = (event) => {
        this.state.newStatementBoxes.push({
            id: this.counter,
            card: <NewStatementGroupCard id={this.counter} key={this.counter} onUpdate={this.reset}
                onCancelClick={this.onCancelClick} getStatementText={this.getStatementText}
                setStatementText={this.setStatementText}/>
        });
        this.counter++;
        this.forceUpdate();
        return false;
    };

    onCancelClick = (event) => {
        const newStatementBoxes = this.state.newStatementBoxes.filter((statementBox) => {
            return statementBox.id != event.cardId;
        });
        this.state.newStatementBoxes = newStatementBoxes;
        this.forceUpdate();
        return false;
    };

    render () {
        const addStatementLinkJsx = <AddStatementLink onClick={this.onAddNewStatementClick}/>;
        const newStatementBoxes = this.state.newStatementBoxes.map((statementBox) => statementBox.card)

        return newStatementBoxes.concat([addStatementLinkJsx]);
    }

}