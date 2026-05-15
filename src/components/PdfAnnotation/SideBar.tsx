'use client';

import { faChevronDown, faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, ButtonGroup, Dropdown, Kbd } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AnnotationCategory from '@/components/PdfAnnotation/AnnotationCategory';
import Help from '@/components/PdfAnnotation/Help';
import isApple from '@/components/PdfAnnotation/helpers/isApple';
import useOntology, { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import Completion from '@/components/PdfAnnotation/ProgressBar';
import Save from '@/components/PdfAnnotation/Save';
import { discardChanges } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

const SideBar = () => {
    const { recommendedClasses, nonRecommendedClasses } = useOntology();
    const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
    const [helpIsOpen, setHelpIsOpen] = useState(false);
    const isLoadedPdfViewer = useSelector((state: RootStore) => state.pdfAnnotation.isLoadedPdfViewer);
    const dispatch = useDispatch();

    const toggleSaveModal = () => {
        setSaveModalIsOpen((isOpen) => !isOpen);
    };

    const handleMenuAction = (key: React.Key) => {
        if (key === 'help') {
            setHelpIsOpen(true);
            return;
        }
        if (key === 'discard') {
            if (window.confirm('Are you sure you want to discard all changes?')) {
                dispatch(discardChanges());
            }
        }
    };

    useEffect(() => {
        if (!isLoadedPdfViewer) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHelpIsOpen(true);
    }, [isLoadedPdfViewer]);

    return (
        <aside className="h-[calc(100vh-73px)] w-[380px] bg-default px-4 pt-4 pb-6 overflow-y-auto flex flex-col gap-3">
            <div className="flex justify-between items-center gap-3">
                <h1 className="text-2xl">Paper annotator</h1>
                <ButtonGroup id="save-annotations">
                    <Button variant="primary" onPress={toggleSaveModal}>
                        Save
                    </Button>
                    <Dropdown>
                        <Button variant="primary" isIconOnly aria-label="Save options">
                            <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
                        </Button>
                        <Dropdown.Popover>
                            <Dropdown.Menu onAction={handleMenuAction}>
                                <Dropdown.Item id="help" textValue="Start help tour">
                                    <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-muted" />
                                    Start help tour
                                </Dropdown.Item>
                                <Dropdown.Item id="discard" textValue="Discard changes">
                                    <FontAwesomeIcon icon={faTrash} className="mr-2 text-muted" />
                                    Discard changes
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </ButtonGroup>
            </div>
            <Completion />
            <Alert>
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Description>
                        To extract survey tables, press and hold the{' '}
                        {isApple ? (
                            <Kbd>
                                <Kbd.Abbr keyValue="option" />
                                <Kbd.Content>Option</Kbd.Content>
                            </Kbd>
                        ) : (
                            <Kbd>
                                <Kbd.Abbr keyValue="alt" />
                                <Kbd.Content>Alt</Kbd.Content>
                            </Kbd>
                        )}{' '}
                        key, while dragging
                    </Alert.Description>
                </Alert.Content>
            </Alert>
            <section id="annotation-categories" className="flex flex-col gap-2">
                {recommendedClasses.map((annotationClass) => (
                    <AnnotationCategory annotationClass={annotationClass} hideEmpty={false} key={annotationClass.iri} />
                ))}
            </section>
            <section id="annotation-tables" className="flex flex-col gap-2">
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
            </section>
            {nonRecommendedClasses.length > 0 && (
                <>
                    <hr className="border-border" />
                    <section className="flex flex-col gap-2">
                        {nonRecommendedClasses.map((annotationClass) => (
                            <AnnotationCategory annotationClass={annotationClass} hideEmpty key={annotationClass.iri} />
                        ))}
                    </section>
                </>
            )}
            <Help isOpen={helpIsOpen} setIsOpen={setHelpIsOpen} />
            <Save isOpen={saveModalIsOpen} toggle={toggleSaveModal} />
        </aside>
    );
};

export default SideBar;
