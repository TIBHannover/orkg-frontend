'use client';

import { reverse } from 'named-urls';
import { redirect, useSearchParams } from 'next/navigation';

import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';

const Search = () => {
    const { searchTerm } = useParams();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchTerm);

    return redirect(`${reverse(ROUTES.SEARCH)}?${params.toString()}`);
};

export default Search;
