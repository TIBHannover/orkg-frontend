import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import Authors from 'components/PaperCard/Authors';
import useSmartReviewResearchField from './hooks/useSmartReviewResearchField';
import PropTypes from 'prop-types';
import { CardBadge } from 'components/styled';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import UserAvatar from 'components/UserAvatar/UserAvatar';

const SmartReviewCardStyled = styled.div`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const SmartReviewCard = ({ versions, showCurationFlags, showBadge }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: versions[0]?.id,
        unlisted: versions[0]?.unlisted,
        featured: versions[0]?.featured
    });

    const { researchField, authors, isLoading: isLoadingMetaData } = useSmartReviewResearchField({
        smartReviewId: versions[0]?.id,
        initResearchField: versions[0]?.researchField,
        initAuthors: versions[0]?.authors
    });

    return (
        <SmartReviewCardStyled className={`list-group-item list-group-item-action d-flex pr-3 ${showCurationFlags ? ' pl-2  ' : ' pl-4  '}`}>
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
                    <Link to={reverse(ROUTES.SMART_REVIEW, { id: versions[0]?.id })}>{versions[0]?.label}</Link>
                    {showBadge && (
                        <div>
                            <CardBadge color="primary">SmartReview</CardBadge>
                        </div>
                    )}
                    <div>
                        <small>
                            {!isLoadingMetaData && <Authors authors={authors} />}
                            {isLoadingMetaData && 'Loading...'}
                            {versions[0].created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" /> {moment(versions[0].created_at).format('DD-MM-YYYY')}
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
                                        <Link to={reverse(ROUTES.SMART_REVIEW, { id: version.id })}>Version {versions.length - index}</Link>
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
        </SmartReviewCardStyled>
    );
};

SmartReviewCard.propTypes = {
    versions: PropTypes.array.isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired
};

SmartReviewCard.defaultProps = {
    showBadge: true,
    showCurationFlags: true
};

export default SmartReviewCard;
