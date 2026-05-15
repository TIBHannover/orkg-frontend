import { Cite } from '@citation-js/core';
import { Alert, Skeleton } from '@heroui/react';
import ky from 'ky';
import { useContext } from 'react';
import useSWR from 'swr';

import { reviewContext, UsedReference } from '@/components/Review/context/ReviewContext';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';

const SKELETON_WIDTHS = ['w-11/12', 'w-10/12', 'w-9/12', 'w-11/12', 'w-8/12', 'w-10/12', 'w-11/12', 'w-9/12', 'w-10/12', 'w-8/12'];

const References = () => {
    const { id } = useParams();
    const { usedReferences } = useContext(reviewContext);
    const { isEditMode } = useIsEditMode();

    const getBibliography = async (usedRefs: UsedReference, reviewId: string) => {
        const bibtex = Object.values(usedRefs)
            .map((section) => (Object.values(section).length > 0 ? Object.values(section).filter((reference) => reference) : []))
            .join('');

        const usedReferencesCite = await Cite.async(bibtex);
        const usedReferencesIds = usedReferencesCite.data?.map((reference: { id: string }) => reference?.id);
        if (!bibtex) {
            return null;
        }

        return ky.get<{ bibliography: string }>(ROUTES.CITATIONS, { searchParams: { usedReferences: usedReferencesIds, reviewId } }).json();
    };

    const { data: bibliography, error, isLoading } = useSWR([usedReferences, id], ([_usedReferences, _id]) => getBibliography(_usedReferences, _id));

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 py-2">
                {SKELETON_WIDTHS.map((width, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Skeleton key={`${width}-${i}`} className={`h-4 rounded ${width}`} />
                ))}
            </div>
        );
    }

    if (error && isEditMode) {
        return (
            <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>BibTeX parsing error</Alert.Title>
                    <Alert.Description>Please check the BibTeX entries for invalid syntax.</Alert.Description>
                </Alert.Content>
            </Alert>
        );
    }

    if (!bibliography) {
        return null;
    }

    return (
        <ul
            className={[
                'review-references mt-2 list-none p-0 text-sm leading-relaxed text-foreground/85',
                '[&_.csl-bib-body]:flex [&_.csl-bib-body]:flex-col [&_.csl-bib-body]:gap-3',
                '[&_li]:block [&_li]:scroll-mt-24 [&_li]:break-words [&_li]:pl-8 [&_li]:-indent-8',
                '[&_li]:border-b [&_li]:border-default-200/60 [&_li]:pb-3 [&_li:last-child]:border-b-0 [&_li:last-child]:pb-0',
                '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
                '[&_i]:italic',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: bibliography.bibliography }}
        />
    );
};

export default References;
