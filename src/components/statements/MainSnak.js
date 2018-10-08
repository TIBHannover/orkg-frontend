import React, {Component} from 'react';
import ObjectTypeSelector from './ObjectTypeSelector';
import EditableDropdown from './new/EditableDropdown';

export default class MainSnak extends Component {

    state = {
        selectedPropertyId: null,
    };

    handleItemSelect = (itemName) => {
        this.props.onObjectTypeSelect(itemName);
    };

    handlePropertySelect = (propertyId) => {
        this.setState({selectedPropertyId: propertyId});
    };

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
                                ? <a href={'/resource/' + this.props.id}>
                                    {this.props.value}
                                </a>
                                : this.props.value
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
                            <EditableDropdown onItemSelected={this.handlePropertySelect}/>
                        </div>
                    </div>
                }
                {
                    !this.props.newProperty || this.state.selectedPropertyId != null ?
                    <div className="snakView-value-container" dir="auto">
                        <ObjectTypeSelector onItemSelect={this.handleItemSelect} objectType={this.props.objectType}/>
                        {shouldShowQuotes && <div className="valueView-input-group-prepend">
                            <span className="valueView-input-group-text">&quot;</span>
                        </div>}

                        <div className="snakView-body">
                            <div className="snakView-value snakView-variation-valueSnak ">
                                <div className="valueView valueView-inEditMode">
                                    <div className="valueView-value">
                                        <textarea className="valueView-input" defaultValue={this.props.value}
                                                  style={inputStyle} onInput={this.props.onInput}
                                                  autoFocus={this.state.selectedPropertyId != null}>
                                        </textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="snakView-indicators"></div>
                        </div>
                        {shouldShowQuotes && <div className="valueView-input-group-prepend">
                            <span className="valueView-input-group-text">&quot;</span>
                        </div>}
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