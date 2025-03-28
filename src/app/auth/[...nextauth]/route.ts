import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { env } from 'next-runtime-env';

import { AuthOptions, refreshAccessToken } from '@/lib/auth';

const handler = NextAuth({
    ...AuthOptions,
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                return {
                    ...token,
                    id_token: account.id_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at as number,
                    refresh_token: account.refresh_token,
                } as JWT;
            }
            // Subsequent logins, but the `access_token` is still valid for 1 minute, return the token as is
            if (Date.now() < token.expires_at * 1000 - 60 * 1000) {
                return token;
            }
            // Subsequent logins, but the `access_token` has expired or will expire soon, try to refresh it
            if (!token.refresh_token) throw new TypeError('Missing refresh_token');
            return refreshAccessToken(token);
        },
        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            return {
                ...session,
                access_token: token.access_token,
                expires_at: token.expires_at,
                error: token.error, // Propagate refresh errors
            };
        },
    },
    jwt: {
        secret: env('NEXTAUTH_SECRET'),
    },
    session: {
        strategy: 'jwt',
        maxAge: 60 * 30,
    },
});

export { handler as GET, handler as POST };
