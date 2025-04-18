import { faHeart, faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import styled from 'styled-components';

import AnnotationCategory from '@/components/PdfTextAnnotation/AnnotationCategory';
import Help from '@/components/PdfTextAnnotation/Help';
import useOntology from '@/components/PdfTextAnnotation/hooks/useOntology';
import Completion from '@/components/PdfTextAnnotation/ProgressBar';
import Save from '@/components/PdfTextAnnotation/Save';
import { discardChanges } from '@/slices/pdfTextAnnotationSlice';

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
    const [helpIsOpen, setHelpIsOpen] = useState(false);
    const isLoadedPdfViewer = useSelector((state) => state.pdfTextAnnotation.isLoadedPdfViewer);
    const dispatch = useDispatch();

    const toggleSaveModal = () => {
        setSaveModalIsOpen((isOpen) => !isOpen);
    };

    const handleDiscardChanges = () => {
        if (window.confirm('Are you sure you want to discard all changes?')) {
            dispatch(discardChanges());
        }
    };

    // ensure the help tour is opened automatically only the first time the pdfViewer is initialized
    useEffect(() => {
        if (!isLoadedPdfViewer) {
            return;
        }
        setHelpIsOpen(true);
    }, [isLoadedPdfViewer]);

    return (
        <SideBarStyled>
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="h4 mt-4 mb-4">Paper annotator</h1>

                <ButtonDropdown isOpen={saveDropdownIsOpen} toggle={() => setSaveDropdownIsOpen(!saveDropdownIsOpen)} id="save-annotations">
                    <Button id="caret" color="primary" onClick={toggleSaveModal}>
                        Save
                    </Button>
                    <DropdownToggle caret color="primary" className="ps-1 pe-2" />
                    <DropdownMenu end="true">
                        <DropdownItem onClick={() => setHelpIsOpen(true)}>
                            <FontAwesomeIcon icon={faQuestionCircle} className="me-2 text-secondary" />
                            Start help tour
                        </DropdownItem>
                        <DropdownItem onClick={handleDiscardChanges}>
                            <FontAwesomeIcon icon={faTrash} className="me-2 text-secondary" />
                            Discard changes
                        </DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>

            <Completion />

            {/* <SmartSentenceDetection pdfViewer={pdfViewer} /> */}

            <div id="annotation-categories">
                {recommendedClasses.map((annotationClass) => (
                    <AnnotationCategory annotationClass={annotationClass} hideEmpty={false} key={annotationClass.iri} />
                ))}
            </div>

            <hr />

            {nonRecommendedClasses.map((annotationClass) => (
                <AnnotationCategory annotationClass={annotationClass} hideEmpty key={annotationClass.iri} />
            ))}

            <HeartsAreRed className="text-center pt-3">
                Made with <FontAwesomeIcon icon={faHeart} /> in Hannover
            </HeartsAreRed>

            <Help isOpen={helpIsOpen} setIsOpen={setHelpIsOpen} />

            <Save isOpen={saveModalIsOpen} toggle={toggleSaveModal} />
        </SideBarStyled>
    );
};

SideBar.propTypes = {
    pdfViewer: PropTypes.object,
};

export default SideBar;
