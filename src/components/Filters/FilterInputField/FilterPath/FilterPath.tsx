import { faAngleDoubleRight, faEllipsis, faRoute, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Link from 'next/link';
import { BreadcrumbStyled, TippyContentStyled } from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC } from 'react';
import { getPredicatesByIds, predicatesUrl } from 'services/backend/predicates';
import { FilterConfig } from 'services/backend/types';
import useSWR from 'swr';

type FilterPathProps = {
    filter: FilterConfig;
};

const FilterPath: FC<FilterPathProps> = ({ filter }) => {
    const { data: path, isLoading } = useSWR([filter.path.map((p) => p), predicatesUrl, 'getPredicatesByIds'], ([params]) =>
        getPredicatesByIds(params),
    );

    return (
        <BreadcrumbStyled className="d-inline">
            <Tippy
                appendTo={document.body}
                interactive
                content={
                    <TippyContentStyled>
                        {!isLoading ? (
                            <small>
                                {filter.exact ? (
                                    <>
                                        This filter is applied on this path: <br /> Contribution{' '}
                                        <FontAwesomeIcon className="me-1 ms-1" icon={faAngleDoubleRight} />
                                    </>
                                ) : (
                                    <>
                                        This filter search for the following path anywhere within the subgraph of the contribution nodes: <br />{' '}
                                        <FontAwesomeIcon className="me-1 ms-1" icon={faEllipsis} />
                                    </>
                                )}
                                {path &&
                                    path.map((property, index: number) => (
                                        <span key={property.id}>
                                            <DescriptionTooltip id={property.id} _class={ENTITIES.PREDICATE}>
                                                <Link href={reverse(ROUTES.PREDICATE, { id: property.id })} target="_blank">
                                                    {property.label}
                                                </Link>
                                            </DescriptionTooltip>
                                            {index !== path.length - 1 && <FontAwesomeIcon className="me-1 ms-1" icon={faAngleDoubleRight} />}
                                        </span>
                                    ))}
                            </small>
                        ) : (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        )}
                    </TippyContentStyled>
                }
            >
                <span>
                    <FontAwesomeIcon size="sm" icon={faRoute} />
                </span>
            </Tippy>
        </BreadcrumbStyled>
    );
};

export default FilterPath;
