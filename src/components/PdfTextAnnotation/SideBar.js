import React, { useState } from 'react';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'reactstrap';
import AnnotationCategory from 'components/PdfTextAnnotation/AnnotationCategory';
import Completion from 'components/PdfTextAnnotation/ProgressBar';
import Save from './Save';

const SideBarStyled = styled.div`
    height: calc(100vh - 73px);
    width: 380px;
    background: #cccfdd;
    padding: 0 15px 30px;
    overflow-y: auto;
`;

// Just having some fun here :) can be removed during release
const HeartsAreRed = styled.div`
    &:hover svg {
        color: red;
    }
    svg {
        transition: 0.5s;
    }
`;

const SideBar = props => {
    const { recommendedClasses, nonRecommendedClasses } = useOntology();
    const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);

    const toggleSaveModal = () => {
        setSaveModalIsOpen(isOpen => !isOpen);
    };
    return (
        <SideBarStyled>
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="h4 mt-4 mb-4">Paper annotator</h1>
                <Button color="primary" onClick={toggleSaveModal}>
                    Save
                </Button>
            </div>

            <Completion />

            {recommendedClasses.map(annotationClass => (
                <AnnotationCategory annotationClass={annotationClass} hideEmpty={false} key={annotationClass.iri} />
            ))}

            <hr />

            {nonRecommendedClasses.map(annotationClass => (
                <AnnotationCategory annotationClass={annotationClass} hideEmpty={true} key={annotationClass.iri} />
            ))}

            <HeartsAreRed className="text-center pt-3">
                Made with <Icon icon={faHeart} /> in Hannover
            </HeartsAreRed>

            <Save isOpen={saveModalIsOpen} toggle={toggleSaveModal} />
        </SideBarStyled>
    );
};

export default SideBar;
