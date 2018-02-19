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
        const articleLabel = binding && binding.articleLabel;
        const articleCreator = binding && binding.articleCreator;
//        const problemLabel = binding && binding.problemLabel;
//        const approachLabel = binding && binding.approachLabel;
//        const implementationLabel = binding && binding.implementationLabel;
//        const plLabel = binding && binding.plLabel;
//        const scalabilityLabel = binding && binding.scalabilityLabel;
//        const evaluationLabel = binding && binding.evaluationLabel;
//        const datasetLabel = binding && binding.datasetLabel;
//        const benchmarkLabel = binding && binding.benchmarkLabel;

//        return (
//            <li>
//                {this.renderField("Article:", articleTitle, "articleTitle")}
//                <ul>
//                    <li>{this.renderField("Addresses problem:", problemLabel, "problemLabel")}</li>
//                    <li>
//                        {this.renderField("Follows approach:", approachLabel, "approachLabel")}
//                        <ul>
//                            <li>
//                                {this.renderField("Has implementation:", implementationLabel, "implementationLabel")}
//                                <ul>
//                                    <li>{this.renderField("Uses PL:", plLabel, "plLabel")}</li>
//                                </ul>
//                            </li>
//                            <li>{this.renderField("Has scalability:", scalabilityLabel, "scalabilityLabel")}</li>
//                            <li>
//                                {this.renderField("Evaluated by:", evaluationLabel, "evaluationLabel")}
//                                <ul>
//                                    <li>{this.renderField("Uses dataset:", datasetLabel, "datasetLabel")}</li>
//                                    <li>{this.renderField("Follows benchmark:", benchmarkLabel, "benchmarkLabel")}</li>
//                                </ul>
//                            </li>
//                        </ul>
//                    </li>
//                </ul>
//            </li>

        return (
            <li>
                {this.renderField("Article:", articleLabel, "articleLabel")}
                {this.renderField(" Creator:", articleCreator, "articleCreator")}
            </li>
        );
    }
}

export default ContentItem;