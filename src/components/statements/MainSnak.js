import React, {Component} from 'react';

export default class EditToolbar extends Component {

    // constructor(props) {
    //     super(props);
    //     this.state = {text: this.props.text};
    //
    //     this.setText = this.setText.bind(this);
    // }
    //
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (nextProps.text !== nextState.text) {
    //         this.setState({text: nextProps.text});
    //     }
    //
    //     return true;
    // }
    //
    // setText(text) {
    //     this.setState({text: text});
    // }

    render() {
        let content = null;
        if (!this.props.editing) {
            content = <div className="snakView">
                <div className="snakView-value-container">
                    <div className="snakView-typeSelector"/>
                    <div className="snakView-body">
                        <div className="snakView-value">
                            <a href={'/contribution/' + this.props.id}>
                                {this.props.text}
                            </a>
                        </div>
                        <div className="snakView-indicators"/>
                    </div>
                </div>
            </div>
        } else {
            const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
            content = <div className="snakView edit" aria-disabled="false">
                {
                    this.props.newProperty && <div className="snakView-property-container">
                        <div className="snakView-property" dir="auto">
                            <input placeholder="property" style={inputStyle}/>
                        </div>
                    </div>
                }
                <div className="snakView-value-container" dir="auto">
                    <div className="snakView-body">
                        <div className="snakView-value snakView-variation-valueSnak ">
                            <div className="valueView valueView-inEditMode">
                                <div className="valueView-value">
                                    <textarea className="valueView-input"
                                            defaultValue={this.props.text}
                                            style={inputStyle}
                                            onInput={this.props.onInput}>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="snakView-indicators"></div>
                    </div>
                </div>
            </div>
        }

        return <div className="statementView-mainSnak">
            {content}
        </div>
    }

}