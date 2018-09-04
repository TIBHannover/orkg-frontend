import React, {Component} from 'react';

export default class Statement extends Component {

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <div className="statementView-mainSnak">
                    <div className="snakView">
                        <div className="snakView-value-container">
                            <div className="snakView-typeSelector"/>
                            <div className="snakView-body">
                                <div className="snakView-value">
                                    {this.props.children}
                                </div>
                                <div className="snakView-indicators"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <span className="toolbar toolbar-container" aria-disabled={false}>
                    <span className="toolbar-button">
                        <a href="#">
                            <span className="fa fa-pencil" aria-hidden="true"></span>
                            edit
                        </a>
                    </span>
                </span>
            </span>
        </div>
    }

}