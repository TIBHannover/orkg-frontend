import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { getUserInformationById } from 'network';
import Items from '../components/UserProfile/Items';
import NotFound from 'pages/NotFound';
import { useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';

/*
const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
`;

const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;
*/

const UserProfile = props => {
    const [displayName, setDisplayName] = useState('');
    const [notFound, setNotFound] = useState(false);
    const userId = props.match.params.userId;
    const currentUserId = useSelector(state => state.auth.user?.id);

    useEffect(() => {
        const getUserInformation = async () => {
            setNotFound(false);

            try {
                const userData = await getUserInformationById(userId);
                const { display_name: displayName } = userData;

                setDisplayName(displayName);
            } catch (e) {
                setNotFound(true);
            }
        };

        getUserInformation();
    }, [userId]);

    if (notFound) {
        return <NotFound />;
    }

    return (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Contributions by {displayName}</h1>
            </Container>
            {/*<Container className="box pt-4 pb-3 pl-5 pr-5">
                <Row>
                    <div className="col-1 text-center">
                        <StyledGravatar className="rounded-circle" email="example@example.com" size={76} id="TooltipExample" />{' '}
                        TODO: Replace with hash from email (should be returned by the backend) 
                    </div>
                    <div className="col-11 pl-4">
                        <h2 className="h5">{this.state.displayName}</h2>
                        TODO: support more information for users, like organization and short bio
                        <p>
                        <b className={'d-block'}>Organization</b>
                        L3S Research Center
                    </p>

                    <p>
                        <b className={'d-block'}>Bio </b>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                        aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    </div>
                </Row>
            </Container>*/}
            <Container className="box rounded mt-4 pt-4 pb-3 pl-5 pr-5">
                <Row>
                    <Col md={6} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <h5 className="mb-4">Added papers</h5>
                        <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />
                    </Col>
                    <Col md={6} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <h5 className="mb-4">Published comparisons</h5>
                        <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />
                    </Col>
                </Row>
            </Container>
            {/*
            TODO: support for activity feed
            <Container className="box mt-4 pt-4 pb-3 pl-5 pr-5">
            <h5 className="mb-4">Activity feed</h5>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>16 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>10 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
                <div>
                    John Doe commented on predicate <Link to={'/'}>Has Problem</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>5 JULY 2019</div>
                <div>John Doe joined ORKG, welcome!</div>
            </StyledActivity>
            </Container>*/}
        </>
    );
};

UserProfile.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default UserProfile;
