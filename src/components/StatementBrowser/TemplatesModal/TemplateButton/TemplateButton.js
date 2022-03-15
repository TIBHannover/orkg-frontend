import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import TemplateDetailsTooltip from './TemplateDetailsTooltip';
import {
    fillResourceWithTemplate,
    removeEmptyPropertiesOfClass,
    updateResourceClassesAction as updateResourceClasses
} from 'slices/statementBrowserSlice';
import { getTemplateById } from 'services/backend/statements';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const IconWrapper = styled.span`
    background-color: ${props => (props.addMode ? '#d1d5e4' : '#dc3545')};
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
    width: 28px;
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => (props.addMode ? props.theme.secondary : 'white')};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

const TemplateButton = props => {
    const [isSaving, setIsSaving] = useState(false);
    const ref = useRef(null);
    const dispatch = useDispatch();
    const [template, setTemplate] = useState({});
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const resource = useSelector(state => props.resourceId && state.statementBrowser.resources.byId[props.resourceId]);

    const addTemplate = useCallback(() => {
        setIsSaving(true);
        dispatch(
            fillResourceWithTemplate({
                templateID: props.id,
                resourceId: props.resourceId,
                syncBackend: props.syncBackend
            })
        ).then(() => {
            toast.success('Template added successfully');
            ref.current?.removeAttribute('disabled');
            setIsSaving(false);
        });
    }, [dispatch, props.id, props.resourceId, props.syncBackend]);

    const deleteTemplate = useCallback(() => {
        setIsSaving(true);
        // Remove the properties related to the template if they have no values
        dispatch(removeEmptyPropertiesOfClass({ resourceId: props.resourceId, classId: props.classId }));
        dispatch(
            updateResourceClasses({
                resourceId: props.resourceId,
                classes: resource.classes?.filter(c => c !== props.classId) ?? [],
                syncBackend: props.syncBackend
            })
        )
            .then(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                props.syncBackend && toast.success('Resource classes updated successfully');
            })
            .catch(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                toast.error('Something went wrong while updating the classes.');
            });
    }, [dispatch, props.classId, props.resourceId, props.syncBackend, resource.classes]);

    const onTrigger = useCallback(() => {
        if (!isLoaded) {
            setIsTemplateLoading(true);
            getTemplateById(props.id).then(template => {
                setTemplate(template);
                setIsLoaded(true);
                setIsTemplateLoading(false);
            });
        }
    }, [isLoaded, props.id]);

    return (
        <Tippy
            onTrigger={onTrigger}
            interactive={true}
            appendTo={document.body}
            content={
                <TemplateDetailsTooltip
                    useTemplate={addTemplate}
                    id={props.id}
                    source={props.source}
                    isTemplateLoading={isTemplateLoading}
                    template={template}
                    addMode={props.addMode}
                />
            }
        >
            <span tabIndex="0">
                <Button
                    innerRef={ref}
                    onClick={() => {
                        ref.current.setAttribute('disabled', 'disabled');
                        props.addMode && addTemplate();
                        !props.addMode && deleteTemplate();
                    }}
                    size="sm"
                    color={props.addMode ? 'light' : 'danger'}
                    className="me-2 mb-2 position-relative px-3 rounded-pill border-0"
                >
                    <IconWrapper addMode={props.addMode}>
                        {!isSaving && props.addMode && <Icon size="sm" icon={faPlus} />}
                        {!isSaving && !props.addMode && <Icon size="sm" icon={faTimes} />}
                        {isSaving && <Icon icon={faSpinner} spin />}
                    </IconWrapper>
                    <Label>{props.label}</Label>
                </Button>
            </span>
        </Tippy>
    );
};

TemplateButton.propTypes = {
    addMode: PropTypes.bool.isRequired,
    resourceId: PropTypes.string, // The resource that will contain the template
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    classId: PropTypes.string,
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    syncBackend: PropTypes.bool.isRequired,
    tippyTarget: PropTypes.object
};

TemplateButton.defaultProps = {
    addMode: true,
    label: '',
    syncBackend: false
};

export default TemplateButton;
