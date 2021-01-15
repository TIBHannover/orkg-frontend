import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { firstLoad } from 'actions/auth';
import Unauthorized from 'pages/Unauthorized';

export default function requireAuthentication(Component) {
    function AuthenticatedComponent(props) {
        const user = useSelector(state => state.auth.user);
        const [isLoadingUser, setIsLoadingUser] = useState(true);
        const dispatch = useDispatch();
        useEffect(() => {
            if (user === 0) {
                setIsLoadingUser(true);
                // First load of user
                dispatch(firstLoad())
                    .then(() => {
                        setIsLoadingUser(false);
                    })
                    .catch(() => {
                        setIsLoadingUser(false);
                    });
            } else {
                setIsLoadingUser(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        if (isLoadingUser) {
            return <Container>Loading....</Container>;
        }
        if (!user) {
            return <Unauthorized />;
        }

        return <Component {...props} />;
    }

    return AuthenticatedComponent;
}
