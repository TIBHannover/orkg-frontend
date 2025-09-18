import { Cite } from '@citation-js/core';
import ky from 'ky';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { reviewContext } from '@/components/Review/context/ReviewContext';
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
    const [bibliography, setBibliography] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const params = useParams();
    const { usedReferences } = useContext(reviewContext);
    const { isEditMode } = useIsEditMode();

    useEffect(() => {
        const parseBibtex = async () => {
            const bibtex = Object.values(usedReferences)
                .map((section) => (Object.values(section).length > 0 ? Object.values(section).filter((reference) => reference) : []))
                .join('');

            const usedReferencesCite = await Cite.async(bibtex);
            const usedReferencesIds = usedReferencesCite.data?.map((reference: { id: string }) => reference?.id);
            if (!bibtex) {
                // remove existing references
                if (bibliography) {
                    setBibliography(null);
                }
                return;
            }

            try {
                // Get the bibliography from the server
                const _bibliography: { bibliography: string } = await ky
                    .post(ROUTES.CITATIONS, { json: { usedReferences: usedReferencesIds, reviewId: params.id } })
                    .json();
                setBibliography(_bibliography.bibliography);
            } catch (e) {
                console.error(e);
                setError(true);
            }
        };
        parseBibtex();
    }, [bibliography, params, usedReferences]);

    return (
        <>
            {!error && bibliography && (
                <ListReferencesStyled dangerouslySetInnerHTML={{ __html: bibliography }} style={{ fontSize: '90%' }} className="ps-3" />
            )}
            {error && isEditMode && <Alert color="danger">BibTeX parsing error, please check the BibTeX entries</Alert>}
        </>
    );
};

export default References;
