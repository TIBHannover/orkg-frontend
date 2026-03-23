'use client';

import { trackAppRouter } from '@socialgouv/matomo-next';
import { usePathname, useSearchParams } from 'next/navigation';
import { env } from 'next-runtime-env';
import { useEffect } from 'react';

const MATOMO_URL = env('NEXT_PUBLIC_MATOMO_TRACKER_URL')!;
const MATOMO_SITE_ID = env('NEXT_PUBLIC_MATOMO_TRACKER_SITE_ID')!;

const MatomoAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (env('NEXT_PUBLIC_MATOMO_TRACKER') !== 'true') return;
        trackAppRouter({
            url: MATOMO_URL,
            siteId: MATOMO_SITE_ID,
            pathname,
            searchParams,
            disableCookies: true, // GDPR-Compliant Tracking
        });
    }, [pathname, searchParams]);

    return null;
};

export default MatomoAnalytics;
