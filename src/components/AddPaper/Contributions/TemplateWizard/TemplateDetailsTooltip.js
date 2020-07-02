import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getTemplateById } from 'network';

export default class TemplateDetailsTooltip extends Component {
    constructor(props) {
        super(props);

        this.state = {
            template: {},
            isTemplateLoading: false,
            isTemplateFailedLoading: true
        };
    }

    componentDidMount = () => {
        this.loadTemplate();
    };

    loadTemplate = () => {
        this.setState({ isTemplateLoading: true, isTemplateFailedLoading: false });
        getTemplateById(this.props.id).then(template => {
            this.setState({ template, isTemplateLoading: false, isTemplateFailedLoading: false });
        });
    };
    render() {
        return (
            <div>
                {this.state.isTemplateLoading && <>Loading...</>}
                {!this.state.isTemplateLoading && (
                    <>
                        {this.props.source && (
                            <div className="mb-1">
                                <b>Template for:</b>
                                <br />
                                <i>{this.props.source.label}</i>
                            </div>
                        )}
                        {this.state.template.components && this.state.template.components.length > 0 && (
                            <div>
                                <b>Properties: </b>
                                <ul>
                                    {this.state.template.components &&
                                        this.state.template.components.length > 0 &&
                                        this.state.template.components.map((component, index) => {
                                            return <li key={`t-${index}-${component.property.id}`}>{component.property.label}</li>;
                                        })}
                                </ul>
                            </div>
                        )}
                        {this.state.template.subTemplates && this.state.template.subTemplates.length > 0 && (
                            <div>
                                <b>Nested Templates: </b>
                                <ul>
                                    {this.state.template.subTemplates.map((subTemplate, index) => {
                                        return <li key={`st-${index}-${subTemplate.id}`}>{subTemplate.label}</li>;
                                    })}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
}

TemplateDetailsTooltip.propTypes = {
    id: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired
};
