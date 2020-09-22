import React, { useState } from 'react';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import AnnotationCategory from 'components/PdfTextAnnotation/AnnotationCategory';
import Completion from 'components/PdfTextAnnotation/ProgressBar';
import Save from './Save';
import SmartSentenceDetection from './SmartSentenceDetection';
import { discardChanges } from 'actions/pdfTextAnnotation';
import { useDispatch } from 'react-redux';

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

const SideBar = () => {
    const { recommendedClasses, nonRecommendedClasses } = useOntology();
    const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
    const [saveDropdownIsOpen, setSaveDropdownIsOpen] = useState(false);
    const dispatch = useDispatch();

    const toggleSaveModal = () => {
        setSaveModalIsOpen(isOpen => !isOpen);
    };

    const handleDiscardChanges = () => {
        if (window.confirm('Are you sure you want to discard all changes?')) {
            dispatch(discardChanges());
        }
    };

    return (
        <SideBarStyled>
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="h4 mt-4 mb-4">Paper annotator</h1>

                <ButtonDropdown isOpen={saveDropdownIsOpen} toggle={() => setSaveDropdownIsOpen(!saveDropdownIsOpen)}>
                    <Button id="caret" color="primary" onClick={toggleSaveModal}>
                        Save
                    </Button>
                    <DropdownToggle caret color="primary" className="pl-1 pr-2" />
                    <DropdownMenu>
                        <DropdownItem onClick={handleDiscardChanges}>
                            <Icon icon={faTrash} className="mr-2 text-secondary" />
                            Discard changes
                        </DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>

            <Completion />

            <SmartSentenceDetection />

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
