import Unauthorized from 'components/Unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import { RootStore } from 'slices/types';

export default function requireAuthentication<P extends object>(Component: React.ComponentType<P>) {
    // Return a new component that handles the authentication check
    return function AuthenticatedComponent(props: P) {
        // Move hooks inside the component
        const { initialized, authenticated } = useSelector((state: RootStore) => state.auth);

        if (!initialized) {
            return <Container>Loading....</Container>;
        }
        if (initialized && !authenticated) {
            return <Unauthorized />;
        }

        return <Component {...props} />;
    };
}
