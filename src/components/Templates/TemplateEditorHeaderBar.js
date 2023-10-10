import { faDiagramProject, faPen, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Title } from 'components/EditModeHeader/EditModeHeader';
import { useDispatch, useSelector } from 'react-redux';
import useParams from 'components/NextJsMigration/useParams';
import { CSSTransition } from 'react-transition-group';
import { Button, ButtonGroup, Container } from 'reactstrap';
import { saveTemplate, setDiagramMode, setEditMode } from 'slices/templateEditorSlice';
import styled from 'styled-components';

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
        color: ${props => props.theme.secondaryDarker};
    }
`;

const AnimationContainer = styled(CSSTransition)`
    &.fade-appear {
        max-height: 0;
        transition: max-height 0.5s ease;
        overflow: hidden;
        padding: 0;
    }

    &.fade-appear-active {
        transition: max-height 0.5s ease;
        max-height: 50px;
    }
`;

const TemplateEditorHeaderBar = () => {
    const dispatch = useDispatch();
    const editMode = useSelector(state => state.templateEditor.editMode);
    const isSaving = useSelector(state => state.templateEditor.isSaving);
    const label = useSelector(state => state.templateEditor.label);
    const { id } = useParams();

    return (
        <AnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
            <PaperHeaderBarContainer>
                <Container className="d-flex align-items-center py-2">
                    {editMode && <Title>{id ? 'Edit mode' : 'Create template'}</Title>}
                    {!editMode && <Title>Template: {label}</Title>}
                    {editMode || isSaving ? (
                        <ButtonGroup size="sm">
                            <Button
                                className="float-start"
                                disabled={isSaving}
                                style={{ marginLeft: 1 }}
                                color="secondary"
                                onClick={() => {
                                    window.scrollTo({
                                        behavior: 'smooth',
                                        top: 0,
                                    });
                                    dispatch(saveTemplate());
                                }}
                            >
                                {isSaving && <Icon icon={faSpinner} spin />}
                                {editMode && <Icon icon={faSave} />}
                                {!isSaving ? ' Save' : ' Saving'}
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <ButtonGroup size="sm">
                            <Button className="float-end" color="secondary" size="sm" onClick={() => dispatch(setEditMode(true))}>
                                <Icon icon={faPen} /> Edit
                            </Button>
                            <Button
                                style={{ marginLeft: 1 }}
                                className="float-end"
                                color="secondary"
                                size="sm"
                                onClick={() => dispatch(setDiagramMode(true))}
                            >
                                <Icon icon={faDiagramProject} /> View diagram
                            </Button>
                        </ButtonGroup>
                    )}
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
};

export default TemplateEditorHeaderBar;
