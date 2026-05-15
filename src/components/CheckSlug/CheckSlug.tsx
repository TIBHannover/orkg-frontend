import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';

import useParams from '@/components/useParams/useParams';
import { reverse } from '@/lib/namedRoute';
import { slugify } from '@/utilsTyped';

/**
 * Component to check if query param slug is valid, and makes a redirect if not
 */
const CheckSlug = ({ label = '', route }: { label?: string; route: string }) => {
    const params = useParams();
    const prevLabel = usePrevious(label);

    useEffect(() => {
        // also check if the label is updated, to ensure redirect is only performed when the label is loaded
        if (label && prevLabel !== label && params.slug !== slugify(label)) {
            redirect(reverse(route, { ...params, slug: slugify(label) }));
        }
    }, [label, params, prevLabel, route]);

    return null;
};

export default CheckSlug;
