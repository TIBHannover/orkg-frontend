import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import FeaturedMark from 'components/FeaturedMark/FeaturedMark';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import UserAvatar from 'components/UserAvatar/UserAvatar';

const ComparisonCardStyled = styled.div`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const SmartReviewCard = ({ versions }) => {
    return (
        <ComparisonCardStyled className="list-group-item list-group-item-action ">
            <Row>
                <Col md={9}>
                    <Link to={reverse(ROUTES.SMART_REVIEW, { id: versions[0]?.id })}>{versions[0]?.label}</Link>
                    <div className="d-inline-block ml-1">
                        <FeaturedMark size="sm" resourceId={versions[0]?.id} />
                    </div>
                    <br />
                    {versions[0].created_at && (
                        <div>
                            <small>
                                <Icon size="sm" icon={faCalendar} /> {moment(versions[0].created_at).format('DD-MM-YYYY')}
                            </small>
                        </div>
                    )}
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
                </Col>
                <div className="col-md-3 text-right d-flex align-items-end flex-column justify-content-end">
                    <UserAvatar userId={versions[0]?.created_by} />
                </div>
            </Row>
        </ComparisonCardStyled>
    );
};

SmartReviewCard.propTypes = {
    versions: PropTypes.array.isRequired
};

export default SmartReviewCard;
