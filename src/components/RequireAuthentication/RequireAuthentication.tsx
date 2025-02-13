import { env } from 'next-runtime-env';
import { isLoggedIn, login } from 'services/keycloak';

type RequireAuthenticationProps = {
    component: React.ComponentType<React.ComponentProps<any>>;
    onClick?: (e: React.MouseEvent) => void;
    href?: string;
} & React.ComponentProps<any>;

const RequireAuthentication = ({ component: Component, ...rest }: RequireAuthenticationProps) => {
    const requireAuthentication = (e: React.MouseEvent) => {
        if (!isLoggedIn()) {
            let redirectUri = rest.href || undefined;
            redirectUri = redirectUri ? `${env('NEXT_PUBLIC_URL')}${redirectUri}` : undefined;
            login({ redirectUri });
            // Don't follow the link when user is not authenticated
            e.preventDefault();
            return null;
        }
        if (rest.onClick) {
            return rest.onClick(e);
        }
        return null;
    };

    return <Component {...rest} onClick={requireAuthentication} />;
};

export default RequireAuthentication;
