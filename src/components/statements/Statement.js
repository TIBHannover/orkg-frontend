import React, {Component} from 'react';
import EditToolbar from "./EditToolbar";
import MainSnak from "./MainSnak";

export default class Statement extends Component {

    state = {
        inEditMode: false
    };

    onEditClick(event) {
        this.setState({inEditMode: true});
    }

    onCancelClick(event) {
        this.setState({inEditMode: false});
    }

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={this.state.inEditMode} text={this.props.text}/>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editing={this.state.inEditMode} onEditClick={this.onEditClick.bind(this)}
                        onCancelClick={this.onCancelClick.bind(this)}/>
            </span>
        </div>
    }

};