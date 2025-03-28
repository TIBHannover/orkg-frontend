'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { Container } from 'reactstrap';

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        signOut({ redirect: false }).then(() => {
            router.push('/');
        });
    }, [router]);

    return (
        <Container className="h-screen w-full flex flex-col items-center justify-center">
            <span>Logging out...</span>
        </Container>
    );
}
