import React, {Component} from 'react';

export default class Statement extends Component {

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainPiece-container">
                <div className="statementView-mainPiece">
                    {this.props.children}
                </div>
            </div>
        </div>
    }

}