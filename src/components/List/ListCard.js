import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import Authors from 'components/PaperCard/Authors';
import useCardData from 'components/ReviewCard/hooks/useCardData';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import PropTypes from 'prop-types';
import { CardBadge } from 'components/styled';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import UserAvatar from 'components/UserAvatar/UserAvatar';

const CardStyled = styled.div`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const ListCard = ({ versions, showBadge, showCurationFlags }) => {
    const { researchField, authors, isLoading: isLoadingMetaData } = useCardData({
        id: versions[0]?.id,
        initResearchField: versions[0]?.researchField,
        initAuthors: versions[0]?.authors
    });

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: versions[0]?.id,
        unlisted: versions[0]?.unlisted,
        featured: versions[0]?.featured
    });

    return (
        <CardStyled style={{ flexWrap: 'wrap' }} className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
                {showCurationFlags && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link to={reverse(ROUTES.LIST, { id: versions[0]?.id })}>{versions[0]?.label}</Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">List</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            {!isLoadingMetaData && <Authors authors={authors} />}
                            {isLoadingMetaData && 'Loading...'}
                            {versions[0].created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-1 me-1" /> {moment(versions[0].created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {versions.length > 1 && (
                        <small>
                            All versions:{' '}
                            {versions.map((version, index) => (
                                <span key={version.id}>
                                    <Tippy content={version.description}>
                                        <Link to={reverse(ROUTES.LIST, { id: version.id })}>Version {versions.length - index}</Link>
                                    </Tippy>{' '}
                                    {index < versions.length - 1 && ' • '}
                                </span>
                            ))}
                        </small>
                    )}
                </div>
            </div>

            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                </div>
                <UserAvatar userId={versions[0]?.created_by} />
            </div>
        </CardStyled>
    );
};

ListCard.propTypes = {
    versions: PropTypes.array.isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired
};

ListCard.defaultProps = {
    showBadge: false,
    showCurationFlags: true
};

export default ListCard;
