import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import format from 'string-format';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import { PREDICATES } from 'constants/graphSettings';

export const HeaderStyled = styled.div`
    border-bottom: 1px ${props => props.theme.secondaryDarker} solid;
`;

export const LinkStyled = styled(Link)`
    .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${props => props.theme.secondaryDarker} solid;
        margin-right: 3px;
        border-radius: 100%;
        font-size: 9px;
        font-weight: bold;
        background: ${props => props.theme.secondary};
    }

    &:hover .typeCircle {
        background: ${props => props.theme.primary};
    }
`;

const TemplateDetailsTooltip = ({ template, isTemplateLoading, source }) => {
    return (
        <div className="p-2">
            {isTemplateLoading && <>Loading...</>}
            {!isTemplateLoading && (
                <>
                    <HeaderStyled className="pb-2 mb-2 d-flex">
                        <div className="flex-grow-1">{template.label}</div>
                        <div>
                            <Tippy content="Go to template page">
                                <Link target="_blank" className="ml-2" to={reverse(ROUTES.TEMPLATE, { id: template.id })}>
                                    <Icon icon={faLink} />
                                </Link>
                            </Tippy>
                        </div>
                    </HeaderStyled>
                    {source?.label && (
                        <div>
                            <b>Template for:</b>
                            <p>
                                <i>{source.label}</i>
                            </p>
                        </div>
                    )}
                    {template.predicate && template.predicate?.id !== PREDICATES.HAS_CONTRIBUTION && (
                        <>
                            <div>
                                <b>Add property:</b>
                                <p>
                                    <i>{template.predicate?.label}</i>
                                </p>
                            </div>
                            {template.class?.id && (
                                <div className="mb-1">
                                    <b>Add value instance of:</b>
                                    <p>
                                        <LinkStyled target="_blank" to={reverse(ROUTES.CLASS, { id: template.class?.id })}>
                                            <i>
                                                <div className="typeCircle">C</div> {template.class?.label}
                                            </i>
                                        </LinkStyled>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    {(!template.predicate || template.predicate?.id === PREDICATES.HAS_CONTRIBUTION) && (
                        <>
                            {template.class?.id && (
                                <div>
                                    <b>Add class:</b>
                                    <p>
                                        <LinkStyled target="_blank" to={reverse(ROUTES.CLASS, { id: template.class?.id })}>
                                            <i>
                                                <div className="typeCircle">C</div> {template.class?.label}
                                            </i>
                                        </LinkStyled>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    {template.hasLabelFormat && (
                        <div>
                            <b>Has formatted label:</b>
                            <p>
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
                            </p>
                        </div>
                    )}
                    {template.components?.length > 0 && (
                        <div>
                            <b>{template.predicate && template.predicate?.id !== PREDICATES.HAS_CONTRIBUTION ? 'With' : 'Add'} properties: </b>
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
