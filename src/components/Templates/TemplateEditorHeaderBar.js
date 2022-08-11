import { Container, ButtonGroup, Button } from 'reactstrap';
import { setEditMode, saveTemplate } from 'slices/templateEditorSlice';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faSpinner, faSave } from '@fortawesome/free-solid-svg-icons';
import { CSSTransition } from 'react-transition-group';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Title } from 'components/EditModeHeader/EditModeHeader';

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
    const template = useSelector(state => state.templateEditor.template);
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
                                onClick={() => dispatch(saveTemplate(template))}
                            >
                                {isSaving && <Icon icon={faSpinner} spin />}
                                {editMode && <Icon icon={faSave} />}
                                {!isSaving ? ' Save' : ' Saving'}
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <Button className="float-end" color="secondary" size="sm" onClick={() => dispatch(setEditMode(true))}>
                            <Icon icon={faPen} /> Edit
                        </Button>
                    )}
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
};

export default TemplateEditorHeaderBar;
