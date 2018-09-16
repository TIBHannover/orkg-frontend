import React, {Component} from 'react';

export default class EditToolbar extends Component {

    render() {
        let content = null;
        if (!this.props.editing) {
            content = <div className="snakView">
                <div className="snakView-value-container">
                    <div className="snakView-typeSelector"/>
                    <div className="snakView-body">
                        <div className="snakView-value">
                            <a href="javascript:void(0)">
                                {this.props.text}
                            </a>
                        </div>
                        <div className="snakView-indicators"/>
                    </div>
                </div>
            </div>
        } else {
            content = <div className="snakView edit" aria-disabled="false">
                {/*<div className="snakView-property-container">*/}
                    {/*<div className="snakView-property" dir="auto"></div>*/}
                {/*</div>*/}
                <div className="snakView-value-container" dir="auto">
                    <div className="snakView-body">
                        <div className="snakView-value snakView-variation-valueSnak ">
                            <div className="valueView valueView-inEditMode">
                                <div className="valueView-value">
                                    <textarea className="valueView-input"
                                            defaultValue={this.props.text}
                                            style={{height: "20.7812px", overflow: "hidden", resize: "none"}}
                                            onInput={this.props.onInput}>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="wikibase-snakview-indicators"></div>
                    </div>
                </div>
            </div>
        }

        return <div className="statementView-mainSnak">
            {content}
        </div>
    }

}