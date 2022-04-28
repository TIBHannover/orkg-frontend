import Cite from 'citation-js';
import useScroll from 'components/Review/hooks/useScroll';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Alert } from 'reactstrap';
import styled from 'styled-components';

const ListReferencesStyled = styled.ul`
    & li.blink-figure {
        border-radius: 5px;
        animation: blinkingBackground 5s 1;
    }
    @keyframes blinkingBackground {
        from {
            background-color: ${props => props.theme.lightDarker};
        }
        50% {
            background-color: #fff;
        }
        to {
            background-color: ${props => props.theme.lightDarker};
        }
    }
`;

const ListReferences = () => {
    const usedReferences = useSelector(state => state.review.usedReferences);
    const isEditing = useSelector(state => state.review.isEditing);
    const [bibliography, setBibliography] = useState(null);
    const location = useLocation();
    useScroll();
    const [error, setError] = useState(false);

    useEffect(() => {
        const parseBibtex = async () => {
            const bibtex = Object.values(usedReferences)
                .map(section =>
                    Object.values(section).length > 0
                        ? Object.values(section)
                              .filter(reference => reference)
                              .map(reference => reference?.literal?.label)
                        : []
                )
                .join('');

            if (!bibtex) {
                // remove existing references
                if (bibliography) {
                    setBibliography(null);
                }
                return;
            }

            try {
                // by passing the full bibtex to citation-js, we get sorting and formatting of references for free
                const parsedCitation = await Cite.async(bibtex);
                const _bibliography = parsedCitation.format('bibliography', {
                    format: 'html',
                    template: 'apa',
                    lang: 'en-US',
                    prepend: data => `<li  class="${location.hash === '#reference' + data['id'] ? 'blink-figure' : ''}" id="reference${data['id']}">`,
                    append: () => '</li>'
                });

                setBibliography(_bibliography);
            } catch (e) {
                console.log(e);
                setError(true);
            }
        };
        parseBibtex();
    }, [bibliography, location.hash, usedReferences]);

    return (
        <>
            {!error && <ListReferencesStyled dangerouslySetInnerHTML={{ __html: bibliography }} style={{ fontSize: '90%' }} className="ps-3" />}
            {error && isEditing && <Alert color="danger">BibTeX parsing error, please check the BibTeX entries</Alert>}
        </>
    );
};

export default ListReferences;
