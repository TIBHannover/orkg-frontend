'use client';

import { faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import AnnotationCategory from '@/components/PdfAnnotation/AnnotationCategory';
import Help from '@/components/PdfAnnotation/Help';
import isApple from '@/components/PdfAnnotation/helpers/isApple';
import useOntology, { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import Completion from '@/components/PdfAnnotation/ProgressBar';
import Save from '@/components/PdfAnnotation/Save';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import { discardChanges } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

const SideBarStyled = styled.div`
    height: calc(100vh - 73px);
    width: 380px;
    background: #cccfdd;
    padding: 0 15px 30px;
    overflow-y: auto;
`;

const SideBar = () => {
    const { recommendedClasses, nonRecommendedClasses } = useOntology();
    const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
    const [saveDropdownIsOpen, setSaveDropdownIsOpen] = useState(false);
    const [helpIsOpen, setHelpIsOpen] = useState(false);
    const isLoadedPdfViewer = useSelector((state: RootStore) => state.pdfAnnotation.isLoadedPdfViewer);
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
            <Alert color="info">
                To extract survey tables, press and hold the{' '}
                {isApple ? (
                    <>
                        <kbd>⌥</kbd> option
                    </>
                ) : (
                    <kbd>Alt</kbd>
                )}{' '}
                key, while dragging
            </Alert>
            <div id="annotation-categories">
                {recommendedClasses.map((annotationClass) => (
                    <AnnotationCategory annotationClass={annotationClass} hideEmpty={false} key={annotationClass.iri} />
                ))}
            </div>

            <div id="annotation-tables">
                <AnnotationCategory
                    annotationClass={{
                        iri: SURVEY_TABLES_IRI,
                        label: 'Survey Tables',
                        comment: 'Extract survey tables from the paper',
                        color: '#FFE28F',
                    }}
                    hideEmpty={false}
                />
                <AnnotationCategory
                    annotationClass={{
                        iri: CSVW_TABLE_IRI,
                        label: 'Regular Tables',
                        comment: 'Extract regular tables from the paper',
                        color: '#FFE28F',
                    }}
                    hideEmpty={false}
                />
            </div>

            <hr />

            {nonRecommendedClasses.map((annotationClass) => (
                <AnnotationCategory annotationClass={annotationClass} hideEmpty key={annotationClass.iri} />
            ))}

            <Help isOpen={helpIsOpen} setIsOpen={setHelpIsOpen} />

            <Save isOpen={saveModalIsOpen} toggle={toggleSaveModal} />
        </SideBarStyled>
    );
};

export default SideBar;
