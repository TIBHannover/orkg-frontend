import React, {Component} from 'react';

class ContentItem extends Component {
    constructor(props) {
        super(props);

        this.renderField = this.renderField.bind(this);
        this.renderText = this.renderText.bind(this);
        this.renderInput = this.renderInput.bind(this);
    }

    renderField(text, value, name) {
        const val = value ? value : "";
        if (!this.props.editable) {
            return this.renderText(text, val);
        } else {
            return this.renderInput(text, val, name);
        }
    }

    renderText(text, val) {
        return <span>{text + " " + (val ? "\"" + val.value + "\"" : "")}</span>;
    }

    renderInput(text, val, name) {
        return <label>{text} <input type="text" name={name} defaultValue={val.value} onChange={this.props.onChange}/></label>;
    }

    render() {
        const binding = this.props.binding;

        return (
            <li>
                {this.renderField("Contribution:", binding, "binding")}
            </li>
        );
    }
}

export default ContentItem;