import { faClose, faDiagramProject, faPen, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Title } from '@/components/EditModeHeader/EditModeHeader';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { loadTemplate, saveTemplate, setDiagramMode } from '@/slices/templateEditorSlice';

const PaperHeaderBarContainer = styled.div`
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    background: #e0e2ea;
    z-index: 1000;
    border-bottom: 1px #d1d3d9 solid;
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.13);
    & .title {
        color: ${(props) => props.theme.secondaryDarker};
    }
`;

const AnimationContainer = styled(motion.div)`
    overflow: hidden;
`;

const TemplateEditorHeaderBar = () => {
    const dispatch = useDispatch();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const isSaving = useSelector((state) => state.templateEditor.isSaving);
    const label = useSelector((state) => state.templateEditor.label);
    const { id } = useParams();

    return (
        <AnimationContainer initial={{ maxHeight: 0 }} animate={{ maxHeight: 60 }} transition={{ duration: 0.5, ease: 'easeOut' }} layout>
            <PaperHeaderBarContainer>
                <Container className="d-flex align-items-center py-2">
                    {isEditMode && <Title>{id ? 'Edit mode' : 'Create template'}</Title>}
                    {!isEditMode && <Title>Template: {label}</Title>}
                    {isEditMode || isSaving ? (
                        <ButtonGroup size="sm">
                            <Button
                                className="float-start"
                                disabled={isSaving}
                                style={{ marginLeft: 1 }}
                                color="secondary-darker"
                                onClick={() => {
                                    window.scrollTo({
                                        behavior: 'smooth',
                                        top: 0,
                                    });
                                    dispatch(saveTemplate(toggleIsEditMode));
                                }}
                            >
                                {isSaving && <FontAwesomeIcon icon={faSpinner} spin />}
                                {isEditMode && <FontAwesomeIcon icon={faSave} />}
                                {!isSaving ? ' Save' : ' Saving'}
                            </Button>
                            <Button
                                style={{ marginLeft: 1 }}
                                color="secondary"
                                size="sm"
                                onClick={() => {
                                    dispatch(loadTemplate(id));
                                    toggleIsEditMode(false);
                                }}
                            >
                                <FontAwesomeIcon icon={faClose} className="ms-1" /> Cancel
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <ButtonGroup size="sm">
                            <Button className="float-end" color="secondary" size="sm" onClick={() => toggleIsEditMode(true)}>
                                <FontAwesomeIcon icon={faPen} /> Edit
                            </Button>
                            <Button
                                style={{ marginLeft: 1 }}
                                className="float-end"
                                color="secondary"
                                size="sm"
                                onClick={() => dispatch(setDiagramMode(true))}
                            >
                                <FontAwesomeIcon icon={faDiagramProject} /> View diagram
                            </Button>
                        </ButtonGroup>
                    )}
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
};

export default TemplateEditorHeaderBar;
