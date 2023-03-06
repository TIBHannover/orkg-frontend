import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// A custom hook that builds on useLocation to parse the query string
export default function useQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}
