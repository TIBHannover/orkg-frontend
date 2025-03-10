import { faAngleDoubleRight, faEllipsisH, faHome, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { getFieldParents, researchFieldUrl } from 'services/backend/researchFields';
import { Node } from 'services/backend/types';
import styled from 'styled-components';
import useSWR from 'swr';
import { reverseWithSlug } from 'utils';

export const BreadcrumbStyled = styled.ul`
    list-style: none;
    margin-bottom: 5px;
    font-size: small;

    & .truncate {
        width: 120px;
        white-space: nowrap;
        overflow: hidden !important;
        text-overflow: ellipsis;
        text-align: left;
    }

    & > li {
        & > a {
            color: ${(props) => props.theme.secondary};
            background: ${(props) => props.theme.lightDarker};
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
                border: 0 solid ${(props) => props.theme.lightDarker};
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
                border-left-color: ${(props) => props.theme.lightDarker};
            }
            &:hover,
            &:active {
                background-color: ${(props) => props.theme.primary};
                color: #fff;
                &:before {
                    border-color: ${(props) => props.theme.primary};
                    border-left-color: transparent;
                }
                &:after {
                    border-left-color: ${(props) => props.theme.primary};
                }
            }
        }
    }
`;

export const TippyContentStyled = styled.div`
    text-align: left;
    a {
        color: #fff;
        &:hover {
            color: ${(props) => props.theme.primary};
        }
    }
`;

type RelativeBreadcrumbsProps = {
    researchField?: Node;
};

const RelativeBreadcrumbs: FC<RelativeBreadcrumbsProps> = ({ researchField }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: parentResearchFields, isLoading } = useSWR(
        researchField && isOpen ? [{ fieldId: researchField?.id }, researchFieldUrl, 'getFieldParents'] : null,
        ([params]) => getFieldParents(params),
    );

    if (!researchField) return null;

    return (
        <BreadcrumbStyled className="d-flex p-0">
            <li>
                <Tooltip
                    onTrigger={() => setIsOpen(true)}
                    content={
                        <TippyContentStyled>
                            {!isLoading ? (
                                <small>
                                    <Link href={reverse(ROUTES.HOME)}>
                                        <FontAwesomeIcon className="me-1" icon={faHome} />
                                    </Link>
                                    {parentResearchFields && parentResearchFields?.length > 1 && (
                                        <FontAwesomeIcon className="me-1 ms-1" icon={faAngleDoubleRight} />
                                    )}
                                    {parentResearchFields
                                        ?.slice()
                                        .reverse()
                                        .map((field, index) => (
                                            <span key={field.id}>
                                                <Link href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })}>
                                                    {field.label}
                                                </Link>
                                                {index !== parentResearchFields.length - 1 && (
                                                    <FontAwesomeIcon className="me-1 ms-1" icon={faAngleDoubleRight} />
                                                )}
                                            </span>
                                        ))}
                                </small>
                            ) : (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            )}
                        </TippyContentStyled>
                    }
                >
                    <Link
                        className="d-block text-decoration-none"
                        href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}
                    >
                        <FontAwesomeIcon size="sm" icon={faEllipsisH} className="ms-2 me-1" />
                    </Link>
                </Tooltip>
            </li>

            <li>
                <Tooltip content={researchField.label} disabled={researchField.label?.length <= 18}>
                    <Link
                        className="d-block text-decoration-none"
                        href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}
                    >
                        <div className="truncate">{researchField.label}</div>
                    </Link>
                </Tooltip>
            </li>
        </BreadcrumbStyled>
    );
};

export default RelativeBreadcrumbs;
