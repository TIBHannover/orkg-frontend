import { useSearchParams as useSearchParamsNext } from 'next/navigation';
// import { useSearchParams as useSearchParamsReactRouter } from 'react-router-dom';

// CRA-CODE
// const useSearchParams = () => {
//     // useSearchParamsReactRouter(params);
//     const [searchParams] = useSearchParamsReactRouter();
//     return searchParams;
// };

// export default useSearchParams;

// NEXT-CODE
const useSearchParams = params => useSearchParamsNext(params);

export default useSearchParams;
