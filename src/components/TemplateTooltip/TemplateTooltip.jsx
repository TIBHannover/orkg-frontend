import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import format from 'string-format';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getTemplate } from '@/services/backend/templates';

export const HeaderStyled = styled.div`
    border-bottom: 1px ${(props) => props.theme.secondaryDarker} solid;
`;

export const LinkStyled = styled(Link)`
    .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 15px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${(props) => props.theme.secondaryDarker} solid;
        margin-right: 3px;
        border-radius: 100%;
        font-size: 9px;
        font-weight: bold;
        background: ${(props) => props.theme.secondary};
    }

    &:hover .typeCircle {
        background: ${(props) => props.theme.primary};
    }
`;

const TemplateTooltip = ({ children, id, extraContent = undefined, disabled = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [template, setTemplate] = useState({});

    const onTrigger = () => {
        if (!isLoaded && id) {
            setIsLoading(true);
            getTemplate(id)
                .then((_template) => {
                    if (_template) {
                        setTemplate(_template);
                    }
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    return (
        <Tooltip
            onTrigger={onTrigger}
            content={
                <div style={{ maxWidth: 300 }}>
                    <HeaderStyled className="pb-2 mb-2 d-flex">
                        <div className="flex-grow-1">{template.label}</div>
                        <div>
                            <Tooltip content="Go to template page">
                                <Link target="_blank" className="ms-2" href={reverse(ROUTES.TEMPLATE, { id: template.id })}>
                                    <FontAwesomeIcon icon={faLink} />
                                </Link>
                            </Tooltip>
                        </div>
                    </HeaderStyled>
                    {!isLoading ? (
                        <>
                            {template.description && (
                                <div>
                                    <b>Description:</b>
                                    <p className="small">{template.description}</p>
                                </div>
                            )}
                            {template.predicate && template.predicate?.id !== PREDICATES.HAS_CONTRIBUTION && (
                                <div>
                                    <b>Template property:</b>
                                    <p>
                                        <i>{template.predicate?.label}</i>
                                    </p>
                                </div>
                            )}
                            {template.target_class?.id && (
                                <div>
                                    <b>Target class:</b>
                                    <p>
                                        <LinkStyled target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class?.id })}>
                                            <i>
                                                <span className="typeCircle">C</span> {template.target_class?.label}
                                            </i>
                                        </LinkStyled>
                                    </p>
                                </div>
                            )}
                            {template.formatted_label && (
                                <div>
                                    <b>Has formatted label:</b>
                                    <p>
                                        <i>
                                            {template.properties?.length > 0 &&
                                                format(
                                                    template.formatted_label,
                                                    Object.assign(
                                                        {},
                                                        ...template.properties.map((propertyShape) => ({
                                                            [propertyShape.path.id]: `{${propertyShape.path.label}}`,
                                                        })),
                                                    ),
                                                )}
                                        </i>
                                    </p>
                                </div>
                            )}
                            {template.properties?.length > 0 && (
                                <div>
                                    <b>Properties: </b>
                                    <ul className={`ps-3 ${template?.properties?.length > 7 && 'mb-0'}`}>
                                        {template.properties &&
                                            template.properties.length > 0 &&
                                            template.properties
                                                .slice(0, 10)
                                                .map((propertyShape) => <li key={`t-${propertyShape.path.id}`}>{propertyShape.path.label}</li>)}
                                    </ul>
                                    {template.properties && template.properties.length > 7 && (
                                        <Link target="_blank" className="ms-2 mb-2 d-block" href={reverse(ROUTES.TEMPLATE, { id: template.id })}>
                                            + {(template.properties?.length ?? 0) - 5} more
                                        </Link>
                                    )}
                                </div>
                            )}
                            {extraContent}
                        </>
                    ) : (
                        'Loading ...'
                    )}
                </div>
            }
            disabled={disabled}
        >
            <span tabIndex="0">{children}</span>
        </Tooltip>
    );
};

TemplateTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    extraContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default TemplateTooltip;
