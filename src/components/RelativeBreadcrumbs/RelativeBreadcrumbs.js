import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faSpinner, faHome, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { getParentResearchFields } from 'services/backend/statements';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { reverseWithSlug } from 'utils';

const BreadcrumbStyled = styled.ul`
    list-style: none;
    display: inline-block;
    font-size: small;
    padding: 0;

    & > li {
        float: left;
        .fullPath {
            text-align: left;
            a {
                color: #fff;
                &:hover {
                    color: ${props => props.theme.primary};
                }
            }
        }
        & > a {
            color: ${props => props.theme.darkblue};
            display: block;
            background: ${props => props.theme.ultraLightBlueDarker};
            text-decoration: none;
            position: relative;
            line-height: 20px;
            padding: 0 6px 0 0;
            text-align: center;
            margin-right: 14px;
        }
        &:first-child {
            a {
                padding-left: 0;
                border-radius: 4px 0 0 4px;
                &:before {
                    border: none;
                }
            }
        }
        &:last-child {
            a {
                padding-right: 5px;
                border-radius: 0 4px 4px 0;
                margin-right: 0;
                &:after {
                    border: none;
                }
            }
        }

        & > a {
            &:before,
            &:after {
                content: '';
                position: absolute;
                top: 0;
                border: 0 solid ${props => props.theme.ultraLightBlueDarker};
                border-width: 10px 6px;
                width: 0;
                height: 0;
            }
            &:before {
                left: -12px;
                border-left-color: transparent;
            }
            &:after {
                left: 100%;
                border-color: transparent;
                border-left-color: ${props => props.theme.ultraLightBlueDarker};
            }
            &:hover,
            &:active {
                background-color: ${props => props.theme.primary};
                color: #fff;
                &:before {
                    border-color: ${props => props.theme.primary};
                    border-left-color: transparent;
                }
                &:after {
                    border-left-color: ${props => props.theme.primary};
                }
            }
        }
    }
`;

const RelativeBreadcrumbs = ({ researchField }) => {
    const [parentResearchFields, setParentResearchFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const onTrigger = () => {
        if (!isLoaded && researchField) {
            setIsLoading(true);
            getParentResearchFields(researchField.id)
                .then(result => {
                    setParentResearchFields(result.reverse());
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    return researchField?.id ? (
        <BreadcrumbStyled>
            <li>
                <Tippy
                    onTrigger={onTrigger}
                    interactive={true}
                    content={
                        <div className="fullPath">
                            {!isLoading ? (
                                <small>
                                    {parentResearchFields.map((field, index) => (
                                        <span key={field.id}>
                                            <Link
                                                to={
                                                    index === 0
                                                        ? reverse(ROUTES.HOME)
                                                        : reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })
                                                }
                                            >
                                                {index === 0 ? <Icon className="mr-1" icon={faHome} /> : field.label}
                                            </Link>
                                            {index !== parentResearchFields.length - 1 && <Icon className="mr-1 ml-1" icon={faAngleDoubleRight} />}
                                        </span>
                                    ))}
                                </small>
                            ) : (
                                <Icon icon={faSpinner} spin />
                            )}
                        </div>
                    }
                >
                    <Link to={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}>
                        <Icon size="sm" icon={faEllipsisH} className="ml-2 mr-1" />
                    </Link>
                </Tippy>
            </li>

            <li>
                <Tippy content={researchField.label} disabled={researchField.label?.length <= 15}>
                    <Link to={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}>
                        {truncate(researchField.label, { length: 15 })}
                    </Link>
                </Tippy>
            </li>
        </BreadcrumbStyled>
    ) : null;
};

RelativeBreadcrumbs.propTypes = {
    researchField: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string
    }),
    maximumLabelLength: PropTypes.number
};

export default RelativeBreadcrumbs;
