import type { Metadata } from 'next';

import FeaturedComparisonsPageClient from '@/app/comparisons/featured/FeaturedComparisonsPageClient';

export const metadata: Metadata = {
    title: 'Featured comparisons - ORKG',
};

export default function FeaturedComparisonsPage() {
    return <FeaturedComparisonsPageClient />;
}
