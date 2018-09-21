import React, {Component} from 'react';
import NewStatementGroupCard from './NewStatementGroupCard';
import AddStatementLink from './AddStatementLink';

export default class NewStatementsSection extends Component {

    state = {
        newStatementBoxes: [],
    };

    onAddNewStatement = () => {
        this.state.newStatementBoxes.push(<NewStatementGroupCard onUpdate={this.reset}
                getStatementText={this.getStatementText} setStatementText={this.setStatementText}/>);
        this.forceUpdate();
    };

    render () {
        const newStatementJsx = <NewStatementGroupCard onUpdate={this.reset} getStatementText={this.getStatementText}
                setStatementText={this.setStatementText}/>;
        const addStatementLinkJsx = <AddStatementLink onClick={this.onAddNewStatement}/>;

        return this.state.newStatementBoxes.concat([addStatementLinkJsx]);
    }

}