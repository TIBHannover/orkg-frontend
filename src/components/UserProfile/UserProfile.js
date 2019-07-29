import { Container, Row } from 'reactstrap';
import styled from 'styled-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gravatar from 'react-gravatar';

const StyledGravatar = styled(Gravatar)`
  border: 3px solid ${(props) => props.theme.avatarBorderColor};
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
            <StyledGravatar
              className="rounded-circle"
              email="example@example.com"
              size={76}
              id="TooltipExample"
            />
          </div>
          <div className="col-11 pl-4">
            <h5>John Doe </h5>

            <p>
              <b className={'d-block'}>Organization</b>
              L3S Research Center
            </p>

            <p>
              <b className={'d-block'}>Bio </b>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </Row>
      </Container>
      <Container className="box mt-4 pt-4 pb-3 pl-5 pr-5">
        <h5 className="mb-4">Activity feed</h5>
      </Container>
    </>
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

UserProfile.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfile);
