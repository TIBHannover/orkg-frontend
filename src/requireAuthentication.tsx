import Unauthorized from 'components/Unauthorized/Unauthorized';
import useAuthentication from 'components/hooks/useAuthentication';
import { Container } from 'reactstrap';

export default function requireAuthentication<P extends object>(Component: React.ComponentType<P>) {
    // Return a new component that handles the authentication check
    return function AuthenticatedComponent(props: P) {
        const { status } = useAuthentication();

        if (status === 'loading') {
            return <Container>Loading....</Container>;
        }
        if (status === 'unauthenticated') {
            return <Unauthorized />;
        }

        return <Component {...props} />;
    };
}
