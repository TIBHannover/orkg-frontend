import { useRouter as useRouterNext } from 'next/navigation';
// import { useNavigate } from 'react-router-dom';

// CRA-CODE
// const useRouter = () => {
//     const navigate = useNavigate();
//     return {
//         push: path => navigate(path),
//     };
// };
// export default useRouter;

// NEXT-CODE
const useRouter = params => useRouterNext(params);

export default useRouter;
