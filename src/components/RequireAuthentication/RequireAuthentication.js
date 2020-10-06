import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openAuthDialog } from 'actions/auth';
import PropTypes from 'prop-types';

const RequireAuthentication = ({ component: Component, ...rest }) => {
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    const requireAuthentication = e => {
        if (!user) {
            dispatch(openAuthDialog('signin', true));
            // Don't follow the link when user is not authenticated
            e.preventDefault();
            return null;
        }
        if (rest.onClick) {
            rest.onClick(e);
        }
    };

    return <Component {...rest} onClick={requireAuthentication} />;
};

RequireAuthentication.propTypes = {
    component: PropTypes.elementType.isRequired,
    onClick: PropTypes.func
};

export default RequireAuthentication;
