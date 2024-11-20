import { env } from 'next-runtime-env';
// @ts-expect-error keycloak-js expect "Bundler" as moduleResolution in tsconfig.json
import Keycloak, { type KeycloakInstance } from 'keycloak-js';

// ENV variables are not available in the build process, so we need to set default values here because the keycloak config requires them
const keycloakConfig = {
    url: env('NEXT_PUBLIC_KEYCLOAK_URL') ?? 'http://localhost:8888/',
    realm: env('NEXT_PUBLIC_KEYCLOAK_REALM') ?? 'orkg',
    clientId: env('NEXT_PUBLIC_KEYCLOAK_CLIENT_ID') ?? 'orkg-frontend',
};

const keycloak: KeycloakInstance = new Keycloak(keycloakConfig);

let isInitialized = false;

export const initKeycloak = () => {
    if (!isInitialized && keycloak) {
        isInitialized = true;
        // callback to refresh the token when it expires
        keycloak.onTokenExpired = async () => {
            try {
                await keycloak.updateToken(30);
            } catch (error) {
                console.error('Failed to refresh the token', error);
                keycloak.logout();
            }
        };
        return keycloak
            .init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: `${env('NEXT_PUBLIC_URL')}/silent-check-sso.html` })
            .then((authenticated: boolean) => authenticated)
            .catch((err: Error) => {
                isInitialized = false;
                console.error('Failed to initialize Keycloak', err);
                throw err;
            });
    }
    return Promise.resolve(keycloak?.authenticated ?? false);
};

export const login = ({ redirectUri = '' } = {}) => keycloak?.login({ redirectUri: `${env('NEXT_PUBLIC_URL')}${redirectUri}` });

export const logout = () => keycloak?.logout();

export const accountManagement = () => keycloak?.accountManagement();

export const register = () => keycloak?.register();

export const isLoggedIn = () => !!keycloak?.token;

export const getToken = async () => {
    if (!keycloak) return null;
    try {
        if (keycloak.isTokenExpired()) {
            await keycloak.updateToken(30);
        }
        return keycloak.token ?? null;
    } catch (error) {
        console.error('Failed to refresh token', error);
        keycloak.logout();
        return null;
    }
};

export { keycloak };
