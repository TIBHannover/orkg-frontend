import { redirect as redirectNext } from 'next/navigation';
// import { Navigate } from 'react-router-dom';

// CRA-CODE
// const redirect = params => <Navigate to={params} />;

// export default redirect;

// NEXT-CODE
const redirect = params => redirectNext(params);

export default redirect;
