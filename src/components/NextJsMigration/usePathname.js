import { usePathname as usePathnameNext } from 'next/navigation';

// CRA-CODE
// const usePathname = () => window.location.pathname;
// export default usePathname;

// NEXT-CODE
const usePathname = () => usePathnameNext();

export default usePathname;
