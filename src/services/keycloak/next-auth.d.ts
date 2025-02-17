import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
    /**
     * Returned by the `jwt` callback and `getToken`, when using JWT sessions
     * */
    interface JWT {
        id_token?: string;
        access_token: string;
        expires_at: number;
        refresh_token?: string;
        error?: 'RefreshTokenError';
    }
}

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        error?: 'RefreshTokenError';
        access_token?: string;
        expires_at?: number;
    }
}
