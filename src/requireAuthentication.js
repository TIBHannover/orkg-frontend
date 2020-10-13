import React from 'react';
import { useSelector } from 'react-redux';
import Unauthorized from 'pages/Unauthorized';

export default function requireAuthentication(Component) {
    function AuthenticatedComponent(props) {
        const user = useSelector(state => state.auth.user);

        if (!user) {
            return <Unauthorized />;
        }

        return <Component {...props} />;
    }

    return AuthenticatedComponent;
}
