import React, {Component} from 'react';
import NewStatementGroupCard from './NewStatementGroupCard';
import AddStatementLink from './AddStatementLink';

export default class NewStatementsSection extends Component {

    render () {
        const newStatementJsx = <NewStatementGroupCard onUpdate={this.reset} getStatementText={this.getStatementText}
                setStatementText={this.setStatementText}/>;
        const addStatementLinkJsx = <AddStatementLink/>;

        return [
            newStatementJsx,
            addStatementLinkJsx
        ];
    }

}