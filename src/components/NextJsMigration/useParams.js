import { isArray } from 'lodash';
import { useParams as useParamsNext } from 'next/navigation';

// import { useParams as useParamsReactRouter } from 'react-router-dom';

// CRA-CODE
// const useParams = params => useParamsReactRouter(params);

// export default useParams;

// WARNING: this file cannot be removed when the Nextjs migration files are removed. It is required for decoding the URL params.
// NEXT-CODE
const useParams = (params) => {
    const urlParams = useParamsNext(params);

    // catch-all routes are returned as array, we are currently not using multiple values for routes, so we just take the first value
    // (to make sure a string is returned)
    // https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments
    for (const key in urlParams) {
        if (isArray(urlParams[key])) {
            urlParams[key] = decodeURIComponent(urlParams[key][0]);
        } else {
            urlParams[key] = decodeURIComponent(urlParams[key]);
        }
    }
    return urlParams;
};

export default useParams;
