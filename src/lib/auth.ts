import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { env } from 'next-runtime-env';
import { JWT } from 'next-auth/jwt';
import ky from 'ky';

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
export const refreshAccessToken = async (token: JWT): Promise<JWT> => {
    try {
        const tokenEndpoint = `${env('NEXT_PUBLIC_KEYCLOAK_URL')}/realms/${env('NEXT_PUBLIC_KEYCLOAK_REALM')}/protocol/openid-connect/token`;

        const formData = new URLSearchParams({
            client_id: env('NEXT_PUBLIC_KEYCLOAK_CLIENT_ID')!,
            client_secret: env('KEYCLOAK_CLIENT_SECRET')!,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token as string,
        });

        const refreshedTokens = await ky
            .post(tokenEndpoint, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                timeout: 10000, // 10 second timeout
                retry: {
                    limit: 2,
                    methods: ['post'],
                    statusCodes: [408, 429, 500, 502, 503, 504],
                },
            })
            .json<JWT>();

        if (!refreshedTokens.access_token) {
            throw new Error('Failed to refresh access token');
        }

        return {
            ...token,
            id_token: refreshedTokens.id_token,
            access_token: refreshedTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + (refreshedTokens.expires_in as number)),
            refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
        } as JWT;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshTokenError',
        } as JWT;
    }
};

export const AuthOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: env('NEXT_PUBLIC_KEYCLOAK_CLIENT_ID')!,
            clientSecret: env('KEYCLOAK_CLIENT_SECRET')!,
            issuer: `${env('NEXT_PUBLIC_KEYCLOAK_URL')}/realms/${env('NEXT_PUBLIC_KEYCLOAK_REALM')}`,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name ?? profile.preferred_username,
                    email: profile.email,
                };
            },
            style: { logo: `${env('NEXT_PUBLIC_URL')}/favicon.ico`, bg: '#fff', text: '#000' },
        }),
    ],
};

export default AuthOptions;
