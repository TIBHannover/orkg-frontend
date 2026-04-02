'use client';

import { isArray } from 'lodash';
// eslint-disable-next-line no-restricted-imports
import { useParams as useParamsNext } from 'next/navigation';

// useParams for decoding params
const useParams = <T extends Record<string, string>>() => {
    const urlParams = useParamsNext();

    // catch-all routes are returned as array, we are currently not using multiple values for routes, so we just take the first value
    // (to make sure a string is returned)
    // https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments
    const decodedParams: Record<string, string> = {};
    for (const key in urlParams) {
        const value = urlParams[key];
        decodedParams[key] = decodeURIComponent(isArray(value) ? value[0] : (value as string));
    }
    return decodedParams as T;
};

export default useParams;
