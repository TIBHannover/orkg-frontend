import { Container, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gravatar from 'react-gravatar';

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

class UserProfile extends Component {
    render = () => (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Profile page</h1>
            </Container>
            <Container className="box pt-4 pb-3 pl-5 pr-5">
                <Row>
                    <div className="col-1 text-center">
                        <StyledGravatar className="rounded-circle" email="example@example.com" size={76} id="TooltipExample" />
                    </div>
                    <div className="col-11 pl-4">
                        <h5>John Doe </h5>

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
            </Container>
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
            </Container>
        </>
    );
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

UserProfile.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserProfile);
