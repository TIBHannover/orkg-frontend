import Link from 'next/link';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useObservatoryStats from 'components/Observatory/hooks/useObservatoryStats';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Card, CardBody } from 'reactstrap';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import styled from 'styled-components';

const ObservatoryCardStyled = styled.div`
    cursor: initial;
    .observatoryStats {
        text-align: left;
        font-size: smaller;
    }

    .orgLogo {
        margin-top: 10px;
        border: 1px;
        padding: 2px;
    }

    .observatoryName {
        font-weight: bold;
    }
    &:hover {
        .observatoryName {
            text-decoration: underline;
        }
    }
`;

function ObservatoryCard(props) {
    const { stats, isLoading: isLoadingStats } = useObservatoryStats({ id: props.observatory.id });

    return (
        <ObservatoryCardStyled className="col-6 mb-4">
            <Card className="h-100">
                <Link href={reverse(ROUTES.OBSERVATORY, { id: props.observatory.display_id })} style={{ textDecoration: 'none' }}>
                    <CardBody>
                        {props.observatory.organization_ids.map((oId) => (
                            <span key={oId} style={{ marginLeft: '10px' }}>
                                <img
                                    className="justify-content-center orgLogo"
                                    key={`imageLogo${oId}`}
                                    height="45px"
                                    src={getOrganizationLogoUrl(oId)}
                                    alt={`${oId} logo`}
                                />
                            </span>
                        ))}{' '}
                        <div className="mt-2">
                            <div className="observatoryName">{props.observatory.name}</div>

                            <div className="observatoryStats text-muted">
                                Papers: <b>{!isLoadingStats ? stats.papers : <Icon icon={faSpinner} spin size="sm" />}</b> <br />
                                Comparisons: <b>{!isLoadingStats ? stats.comparisons : <Icon icon={faSpinner} spin size="xs" />}</b>
                            </div>
                        </div>
                    </CardBody>
                </Link>
            </Card>
        </ObservatoryCardStyled>
    );
}

ObservatoryCard.propTypes = {
    observatory: PropTypes.object.isRequired,
};

export default ObservatoryCard;
