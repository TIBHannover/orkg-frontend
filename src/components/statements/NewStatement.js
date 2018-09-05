import React, {Component} from 'react';

export default class NewStatement extends Component {

    render() {
        return <div id="new" className="statementView newStatement">
            <div className="statementView-rankSelector">
                <div className="rankSelector">
                    <span className="fa fa-sort"/>
                </div>
            </div>
            <div className="statementView-mainSnak-container">
                <div className="statementView-mainSnak" dir="auto">
                    <div className="snakView">
                        <div className="snakView-property-container"></div>
                        <div className="snakView-value-container" dir="auto">
                            <div className="snakView-body">
                                <div className="snakView-value">
                                    <div className="valueView" aria-disabled="false">
                                        <div className="valueView-value">
                                            <textarea className="valueView-input" style={{
                                                height: "21.8px",
                                                overflow: "hidden",
                                                resize: "none"
                                            }}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="statementView-qualifiers">
                    <div className="listView"/>
                    <div className="toolbar-container">
                        <span className="toolbar-button toolbar-container">
                            <a href="#" title="">
                                <span className="fa fa-plus"/>
                                add qualifier
                            </a>
                        </span>
                    </div>
                </div>
            </div>
            <div className="statementView-references-container"/>
            <div className="editToolbar-container toolbar-container">
                <span className="toolbar-container toolbar">
                    <span className="toolbar-button toolbar-item toolbar-button-save" aria-disabled={true}>
                        <a href="#" title="" tabIndex={-1}>
                            <span className="fa fa-check"/>
                            publish
                        </a>
                    </span>
                    <span className="toolbar-button toolbar-item toolbar-button-cancel">
                        <a href="#" title="">
                            <span className="fa fa-close"/>
                            cancel
                        </a>
                    </span>
                </span>
            </div>
        </div>
    }

}