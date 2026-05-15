import { faClose, faDiagramProject, faPen, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { loadTemplate, saveTemplate, setDiagramMode } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

const TemplateEditorHeaderBar = () => {
    const dispatch = useDispatch();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const isSaving = useSelector((state: RootStore) => state.templateEditor.isSaving);
    const label = useSelector((state: RootStore) => state.templateEditor.label);
    const { id } = useParams();

    const inEditMode = isEditMode || isSaving;

    return (
        <motion.div
            className="overflow-hidden"
            initial={{ maxHeight: 0 }}
            animate={{ maxHeight: 60 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            layout
        >
            <div
                className={`fixed top-[72px] right-0 left-0 z-[1000] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.13)] ${
                    inEditMode ? 'bg-secondary text-white' : 'bg-default border-b border-border'
                }`}
            >
                <Container className="flex items-center gap-2 py-2 min-h-12">
                    <div className={`text-base sm:text-[1.1rem] grow truncate ${inEditMode ? '' : 'text-secondary-darker'}`}>
                        {inEditMode ? (
                            <>
                                {id ? 'Edit mode' : 'Create template'}
                                <span className="text-sm text-white/70 pl-2 hidden sm:inline">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            `Template: ${label}`
                        )}
                    </div>
                    <div className="inline-flex shrink-0 items-center gap-1">
                        {isEditMode || isSaving ? (
                            <>
                                <Button
                                    className="button--orkg-secondary-darker shrink-0 !h-8"
                                    size="sm"
                                    isDisabled={isSaving}
                                    onPress={() => {
                                        window.scrollTo({ behavior: 'smooth', top: 0 });
                                        // @ts-expect-error untyped thunk
                                        dispatch(saveTemplate(toggleIsEditMode));
                                    }}
                                >
                                    {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    {isSaving ? ' Saving' : ' Save'}
                                </Button>
                                <Button
                                    className="button--orkg-secondary shrink-0 !h-8"
                                    size="sm"
                                    onPress={() => {
                                        // @ts-expect-error untyped thunk
                                        dispatch(loadTemplate(id));
                                        toggleIsEditMode(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faClose} /> Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button className="button--orkg-secondary shrink-0 !h-8" size="sm" onPress={() => toggleIsEditMode(true)}>
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </Button>
                                <Button className="button--orkg-secondary shrink-0 !h-8" size="sm" onPress={() => dispatch(setDiagramMode(true))}>
                                    <FontAwesomeIcon icon={faDiagramProject} /> View diagram
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
            </div>
        </motion.div>
    );
};

export default TemplateEditorHeaderBar;
