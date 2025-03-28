// eslint-disable-next-line no-restricted-imports
import { useSession as useNextAuthSession } from 'next-auth/react';
import { useMemo } from 'react';

import { decodeToken, hasRealmRole, ROLES } from '@/services/keycloak';

const useAuthentication = () => {
    const { data: session, status } = useNextAuthSession();

    const decodedToken = useMemo(() => {
        if (!session?.access_token) return null;
        try {
            const token = decodeToken(session.access_token);
            return token;
        } catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }, [session?.access_token]);

    const user = session?.user
        ? {
              ...session?.user,
              id: decodedToken?.sub,
              resource_access: decodedToken?.realm_access ? (decodedToken.realm_access as { roles: string[] }) : { roles: [] },
              isCurationAllowed: hasRealmRole(ROLES.ROLE_CURATOR, decodedToken?.realm_access),
          }
        : null;

    const isCurationAllowed = user?.isCurationAllowed ?? false;

    return {
        user,
        isCurationAllowed,
        status,
    };
};

export default useAuthentication;
