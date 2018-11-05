import React, {Component} from 'react';
import ObjectTypeSelector from './ObjectTypeSelector';
import EditableDropdown from './new/EditableDropdown';
import {predicatesUrl, resourcesUrl} from '../../network';

export default class MainSnak extends Component {

    state = {
        newPredicateLabel: null,
        selectedPredicateId: null,
        selectedObjectId: null,
    };

    handleItemSelect = (itemName) => {
        this.props.onObjectTypeSelect(itemName);
    };

    handlePropertySelect = (predicateId) => {
        this.setState({
            newPredicateLabel: null,
            selectedPredicateId: predicateId,
        });
        this.props.onPredicateSelect && this.props.onPredicateSelect(predicateId);
    };

    handleNewProperty = (value) => {
        this.setState({
            newPredicateLabel: value.length > 0 ? value : null,
            selectedPredicateId: null,
        });
        this.props.onNewPredicate && this.props.onNewPredicate(value);
    };

    handleObjectSelect = (objectId) => {
        this.setState({selectedObjectId: objectId});
        this.props.onObjectSelect && this.props.onObjectSelect(objectId);
    };

    getInput(isLiteral, inputStyle) {
        if (isLiteral) {
            return [
                <div className="valueView-input-group-prepend">
                    <span className="valueView-input-group-text">&quot;</span>
                </div>,
                <div className="snakView-body">
                    <div className="snakView-value snakView-variation-valueSnak ">
                        <div className="valueView valueView-inEditMode">
                            <div className="valueView-value">
                                <textarea className="valueView-input" defaultValue={this.props.text}
                                        style={inputStyle} onInput={this.props.onInput}
                                        autoFocus={this.state.selectedPredicateId != null}>
                                </textarea>
                            </div>
                        </div>
                    </div>
                    <div className="snakView-indicators"/>
                </div>,
                <div className="valueView-input-group-prepend">
                    <span className="valueView-input-group-text">&quot;</span>
                </div>
            ];
        } else {
            return <div className="snakView-body">
                <div className="snakView-value snakView-variation-valueSnak ">
                    <div className="valueView valueView-inEditMode">
                        <div className="valueView-value">
                            <EditableDropdown requestUrl={resourcesUrl} placeholder="object" value={this.props.text}
                                    onItemSelected={this.handleObjectSelect} onInput={this.props.onInput}/>
                        </div>
                    </div>
                </div>
                <div className="snakView-indicators"/>
            </div>;
        }
    }

    render() {
        let content = null;
        if (!this.props.editing) {
            content = <div className="snakView">
                <div className="snakView-value-container">
                    <div className="snakView-typeSelector"/>
                    <div className="snakView-body">
                        <div className="snakView-value">
                            {
                                this.props.objectType === 'resource'
                                ? <a href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(this.props.id)}`}>
                                    {this.props.text}
                                </a>
                                : this.props.text
                            }
                        </div>
                        <div className="snakView-indicators"/>
                    </div>
                </div>
            </div>
        } else {
            const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
            const shouldShowQuotes = this.props.objectType === 'literal';
            content = <div className="snakView edit" aria-disabled="false">
                {
                    this.props.newProperty && <div className="snakView-property-container">
                        <div className="snakView-property" dir="auto">
                            <EditableDropdown requestUrl={predicatesUrl} placeholder="property"
                                    onItemSelected={this.handlePropertySelect} onEnterPressed={this.handleNewProperty}/>
                        </div>
                    </div>
                }
                {
                    !this.props.newProperty || this.state.selectedPredicateId || this.state.newPredicateLabel ?
                    <div className="snakView-value-container" dir="auto">
                        <ObjectTypeSelector onItemSelect={this.handleItemSelect} objectType={this.props.objectType}/>
                        {this.getInput(shouldShowQuotes, inputStyle)}
                    </div>
                    : null
                }
            </div>
        }

        return <div className="statementView-mainSnak">
            {content}
        </div>
    }

}
