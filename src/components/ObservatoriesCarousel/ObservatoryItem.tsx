import { faCubes, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import useObservatoryStats from 'components/Observatory/hooks/useObservatoryStats';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import Dotdotdot from 'react-dotdotdot';
import { Card, CardBody, CardFooter, CardSubtitle, CardTitle, CarouselItem } from 'reactstrap';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import { Observatory } from 'services/backend/types';
import styled from 'styled-components';

const ObservatoryCardStyled = styled(Card)`
    cursor: initial;
    .orgLogo {
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

const CardFooterStyled = styled(CardFooter)`
    && {
        background: ${(props) => props.theme.lightLighter};
    }
`;

type ObservatoryItemProps = {
    observatory: Observatory;
    onExiting: () => void;
    onExited: () => void;
    active: boolean;
};

const ObservatoryItem = ({ observatory, onExiting, onExited, active }: ObservatoryItemProps) => {
    const { stats, isLoading: isLoadingStats } = useObservatoryStats({ id: observatory.id });

    return (
        <CarouselItem in={active} onExiting={onExiting} onExited={onExited} className="pb-1 pb-4 flex-grow-1">
            <ObservatoryCardStyled className=" d-flex flex-grow-1" style={{ border: 0 }}>
                <CardBody className="pt-0 mb-0">
                    <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })} style={{ textDecoration: 'none' }}>
                        <CardTitle tag="h5">{observatory.name}</CardTitle>
                        <CardSubtitle tag="h6" style={{ height: '20px' }} className="mb-1 text-muted">
                            <Dotdotdot clamp={2}>{observatory.description}</Dotdotdot>
                        </CardSubtitle>
                    </Link>
                    <div className="mt-3 mb-3 ps-2 pe-2">
                        <Link
                            className="text-center d-flex"
                            href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}
                            style={{ textDecoration: 'none', height: '80px', width: '100%', overflow: 'hidden' }}
                        >
                            {observatory.organization_ids.slice(0, 2).map(
                                (
                                    oId, // show only two logos
                                ) => (
                                    <div key={`imageLogo${oId}`} className="flex-grow-1">
                                        <img className="orgLogo" height="60px" src={getOrganizationLogoUrl(oId)} alt={`${oId} logo`} />
                                    </div>
                                ),
                            )}
                        </Link>
                    </div>
                </CardBody>
                <CardFooterStyled className="text-muted">
                    <small>
                        <FontAwesomeIcon icon={faCubes} className="me-1" /> {!isLoadingStats && pluralize('comparison', stats.comparisons, true)}
                        <FontAwesomeIcon icon={faFile} className="me-1 ms-2" />
                        {!isLoadingStats && pluralize('paper', stats.papers, true)}
                    </small>
                    <div className="float-end" style={{ height: '25px' }}>
                        {observatory.members.slice(0, 5).map((contributor) => (
                            <UserAvatar key={contributor} userId={contributor} size={24} />
                        ))}
                    </div>
                </CardFooterStyled>
            </ObservatoryCardStyled>
        </CarouselItem>
    );
};

export default ObservatoryItem;
