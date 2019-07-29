import { Alert, Container } from 'reactstrap';
import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ROUTES from '../../constants/routes';
import { openAuthDialog, resetAuth } from '../../actions/auth';

class Signout extends Component {
  componentDidMount() {
    this.props.resetAuth();
  }

  render() {
    return (
      <>
        <Container className="p-0">
          <h1 className="h4 mt-4 mb-4">Signed out</h1>
        </Container>
        <Container className="box pt-4 pb-3 pl-5 pr-5">
          <Alert color="info">
            You have been signed out successfullly. Go{' '}
            <Link style={{ color: 'inherit', textDecoration: 'underline' }} to={ROUTES.HOME}>
              to the home page
            </Link>{' '}
            or{' '}
            <span
              style={{ color: 'inherit', textDecoration: 'underline' }}
              onClick={() => this.props.openAuthDialog('signin')}
            >
              sigin in again
            </span>
            .
          </Alert>
        </Container>
      </>
    );
  }
}

Signout.propTypes = {
  openAuthDialog: PropTypes.func.isRequired,
  resetAuth: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  resetAuth: () => dispatch(resetAuth()),
  openAuthDialog: action => dispatch(openAuthDialog(action)),
});

export default connect(
  null,
  mapDispatchToProps,
)(Signout);
