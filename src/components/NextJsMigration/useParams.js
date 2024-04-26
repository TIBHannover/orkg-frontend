import { isArray } from 'lodash';
import { useParams as useParamsNext } from 'next/navigation';

// import { useParams as useParamsReactRouter } from 'react-router-dom';

// CRA-CODE
// const useParams = params => useParamsReactRouter(params);

// export default useParams;

// NEXT-CODE
const useParams = (params) => {
    const urlParams = useParamsNext(params);

    // catch-all routes are returned as array, we are currently not using multiple values for routes, so we just take the first value
    // (to make sure a string is returned)
    // https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments
    for (const key in urlParams) {
        if (isArray(urlParams[key])) {
            urlParams[key] = urlParams[key][0];
        }
    }
    return urlParams;
};

export default useParams;
