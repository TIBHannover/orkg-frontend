import PropTypes from 'prop-types';

const TemplateDetailsTooltip = ({ template, isTemplateLoading, source }) => {
    return (
        <div>
            {isTemplateLoading && <>Loading...</>}
            {!isTemplateLoading && (
                <>
                    {source && (
                        <div className="mb-1">
                            <b>Template for:</b>
                            <br />
                            <i>{source.label}</i>
                        </div>
                    )}
                    {template.components && template.components.length > 0 && (
                        <div>
                            <b>Properties: </b>
                            <ul>
                                {template.components &&
                                    template.components.length > 0 &&
                                    template.components.map(component => {
                                        return <li key={`t-${component.property.id}`}>{component.property.label}</li>;
                                    })}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

TemplateDetailsTooltip.propTypes = {
    source: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isTemplateLoading: PropTypes.bool.isRequired
};

export default TemplateDetailsTooltip;
