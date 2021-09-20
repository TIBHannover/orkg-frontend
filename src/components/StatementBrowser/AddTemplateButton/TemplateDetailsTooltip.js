import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import format from 'string-format';

const TemplateDetailsTooltip = ({ template, isTemplateLoading, source }) => {
    return (
        <div className="p-2">
            {isTemplateLoading && <>Loading...</>}
            {!isTemplateLoading && (
                <>
                    {source?.label && (
                        <div className="mb-1">
                            <b>Template for:</b>
                            <br />
                            <i>{source.label}</i>
                        </div>
                    )}
                    {template.predicate && (
                        <>
                            <div className="mb-1">
                                <b>Add property:</b>
                                <br />
                                <i>{template.predicate?.label}</i>
                            </div>
                            <div className="mb-1">
                                <b>Add value instance of:</b>
                                <br />
                                <Link target="_blank" to={reverse(ROUTES.CLASS, { id: template.class?.id })}>
                                    <i>{template.class?.label}</i>
                                </Link>
                            </div>
                            {template.hasLabelFormat && (
                                <div className="mb-1">
                                    <b>Has formatted label:</b>
                                    <br />

                                    <i>
                                        {template.components?.length > 0 &&
                                            format(
                                                template.labelFormat,
                                                Object.assign(
                                                    {},
                                                    ...template.components.map(component => ({
                                                        [component.property.id]: `{${component.property.label}}`
                                                    }))
                                                )
                                            )}
                                    </i>
                                </div>
                            )}
                        </>
                    )}
                    {!template.predicate && (
                        <>
                            {template.class && (
                                <div className="mb-1">
                                    <b>Add class:</b>
                                    <br />
                                    <Link target="_blank" to={reverse(ROUTES.CLASS, { id: template.class?.id })}>
                                        <i>{template.class?.label}</i>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                    {template.components?.length > 0 && (
                        <div>
                            <b>{template.predicate ? 'With' : 'Add'} properties: </b>
                            <ul className="pl-3">
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
    source: PropTypes.object,
    template: PropTypes.object.isRequired,
    isTemplateLoading: PropTypes.bool.isRequired
};

export default TemplateDetailsTooltip;
