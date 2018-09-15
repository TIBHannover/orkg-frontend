import React, {Component} from 'react';
import EditToolbar from "./EditToolbar";
import MainSnak from "./MainSnak";

export default class Statement extends Component {

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={true}>
                    {this.props.children}
                </MainSnak>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editing={true}/>
            </span>
        </div>
    }

}