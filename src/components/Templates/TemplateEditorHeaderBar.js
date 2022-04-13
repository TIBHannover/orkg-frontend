import { Container, ButtonGroup, Button } from 'reactstrap';
import { setEditMode, saveTemplate } from 'slices/templateEditorSlice';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faSpinner, faSave } from '@fortawesome/free-solid-svg-icons';
import { CSSTransition } from 'react-transition-group';
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

function TemplateEditorHeaderBar(props) {
    return (
        <AnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
            <PaperHeaderBarContainer>
                <Container className="d-flex align-items-center py-2">
                    {props.editMode && <Title>{props.id ? 'Edit mode' : 'Create template'}</Title>}
                    {!props.editMode && <Title>Template: {props.label}</Title>}
                    {props.editMode || props.isSaving ? (
                        <ButtonGroup size="sm">
                            <Button
                                className="float-start"
                                disabled={props.isSaving}
                                style={{ marginLeft: 1 }}
                                color="secondary"
                                onClick={() => props.saveTemplate(props.template)}
                            >
                                {props.isSaving && <Icon icon={faSpinner} spin />}
                                {props.editMode && <Icon icon={faSave} />}
                                {!props.isSaving ? ' Save' : ' Saving'}
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <Button className="float-end" color="secondary" size="sm" onClick={() => props.setEditMode(true)}>
                            <Icon icon={faPen} /> Edit
                        </Button>
                    )}
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
}

TemplateEditorHeaderBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    setEditMode: PropTypes.func.isRequired,
    saveTemplate: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    isSaving: PropTypes.bool.isRequired,
    template: PropTypes.object.isRequired,
    id: PropTypes.string
};

const mapStateToProps = state => {
    return {
        editMode: state.templateEditor.editMode,
        isSaving: state.templateEditor.isSaving,
        label: state.templateEditor.label,
        template: state.templateEditor
    };
};

const mapDispatchToProps = dispatch => ({
    setEditMode: data => dispatch(setEditMode(data)),
    saveTemplate: data => dispatch(saveTemplate(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemplateEditorHeaderBar);
