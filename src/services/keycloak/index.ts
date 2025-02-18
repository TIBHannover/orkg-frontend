import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from 'next-runtime-env';
import { signOut } from 'next-auth/react';

export const ROLES = {
    ROLE_ADMIN: 'admin',
    ROLE_CURATOR: 'curator',
};

export const federatedLogout = async () => {
    try {
        const response = await fetch(`${env('NEXT_PUBLIC_URL')}/auth/federated-logout`);
        const data = await response.json();
        if (response.ok) {
            await signOut({ redirect: false });
            window.location.href = data.url;
            return;
        }
        throw new Error(data.error);
    } catch (error) {
        await signOut({ redirect: false });
        window.location.href = '/';
    }
};

export const decodeToken = (token: string) => {
    const decodedToken = jwt.decode(token) as JwtPayload;
    return decodedToken;
};

export const hasRealmRole = (role: string, access: { roles: string[] }) => {
    return !!access && access.roles?.indexOf?.(role) >= 0;
};

export const visitAccountUrl = (referrerUrl: string) => {
    const url = `${env('NEXT_PUBLIC_KEYCLOAK_URL')}/realms/${env('NEXT_PUBLIC_KEYCLOAK_REALM')}/account?referrer=${env(
        'NEXT_PUBLIC_KEYCLOAK_CLIENT_ID',
    )}&referrer_uri=${referrerUrl}`;
    window.location.href = url;
};
