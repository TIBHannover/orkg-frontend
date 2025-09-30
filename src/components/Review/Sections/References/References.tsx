import { Cite } from '@citation-js/core';
import ky from 'ky';
import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';
import useSWR from 'swr';

import { reviewContext, UsedReference } from '@/components/Review/context/ReviewContext';
import Alert from '@/components/Ui/Alert/Alert';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';

const ListReferencesStyled = styled.ul`
    & li.blink-figure {
        border-radius: 5px;
        animation: blinkingBackground 5s 1;
    }
    @keyframes blinkingBackground {
        from {
            background-color: ${(props) => props.theme.lightDarker};
        }
        50% {
            background-color: #fff;
        }
        to {
            background-color: ${(props) => props.theme.lightDarker};
        }
    }
`;

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

        // Get the bibliography from the server
        return ky.get<{ bibliography: string }>(ROUTES.CITATIONS, { searchParams: { usedReferences: usedReferencesIds, reviewId } }).json();
    };

    const { data: bibliography, error, isLoading } = useSWR([usedReferences, id], ([_usedReferences, _id]) => getBibliography(_usedReferences, _id));

    return (
        <>
            {!error && bibliography && !isLoading && (
                <ListReferencesStyled dangerouslySetInnerHTML={{ __html: bibliography?.bibliography }} style={{ fontSize: '90%' }} className="ps-3" />
            )}
            {error && isEditMode && !isLoading && <Alert color="danger">BibTeX parsing error, please check the BibTeX entries</Alert>}
            {isLoading && <Skeleton count={10} />}
        </>
    );
};

export default References;
