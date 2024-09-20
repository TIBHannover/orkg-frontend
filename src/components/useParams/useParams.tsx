import { isArray } from 'lodash';
// eslint-disable-next-line no-restricted-imports
import { useParams as useParamsNext } from 'next/navigation';

// useParams for decoding params
const useParams = <T extends Record<string, string>>() => {
    const urlParams = useParamsNext();

    // catch-all routes are returned as array, we are currently not using multiple values for routes, so we just take the first value
    // (to make sure a string is returned)
    // https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments
    for (const key in urlParams) {
        if (isArray(urlParams[key])) {
            urlParams[key] = decodeURIComponent(urlParams[key][0]);
        } else {
            urlParams[key] = decodeURIComponent(urlParams[key] as string);
        }
    }
    return urlParams as T;
};

export default useParams;
