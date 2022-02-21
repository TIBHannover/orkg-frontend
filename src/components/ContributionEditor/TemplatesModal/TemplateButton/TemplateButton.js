import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import TemplateDetailsTooltip from 'components/StatementBrowser/TemplatesModal/TemplateButton/TemplateDetailsTooltip';
import { fillContributionsWithTemplate, removeEmptyPropertiesOfClass, removeClassFromContributionResource } from 'slices/contributionEditorSlice';
import { getTemplateById } from 'services/backend/statements';
import { useDispatch } from 'react-redux';
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

    const addTemplate = useCallback(() => {
        setIsSaving(true);

        dispatch(
            fillContributionsWithTemplate({
                templateID: props.id
            })
        ).then(() => {
            toast.success('Template added successfully');
            ref.current?.removeAttribute('disabled');
            setIsSaving(false);
        });
    }, [dispatch, props.id]);

    const deleteTemplate = useCallback(() => {
        setIsSaving(true);
        // Remove the properties related to the template if they have no values
        dispatch(removeEmptyPropertiesOfClass({ classId: props.classId }));
        dispatch(removeClassFromContributionResource({ classId: props.classId }))
            .then(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                toast.success('Contributions classes updated successfully');
            })
            .catch(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                toast.error('Something went wrong while updating the classes.');
            });
    }, []);

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
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    classId: PropTypes.string,
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    tippyTarget: PropTypes.object
};

TemplateButton.defaultProps = {
    addMode: true,
    label: ''
};

export default TemplateButton;
