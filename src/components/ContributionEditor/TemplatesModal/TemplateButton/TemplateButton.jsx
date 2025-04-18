import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import styled from 'styled-components';

import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { fillContributionsWithTemplate, removeClassFromContributionResource, removeEmptyPropertiesOfClass } from '@/slices/contributionEditorSlice';

const IconWrapper = styled.span`
    background-color: ${(props) => (props.addMode ? '#d1d5e4' : '#dc3545')};
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
    color: ${(props) => (props.addMode ? props.theme.secondary : 'white')};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

const TemplateButton = ({ addMode = true, label = '', id, classId }) => {
    const [isSaving, setIsSaving] = useState(false);
    const ref = useRef(null);
    const dispatch = useDispatch();

    const addTemplate = useCallback(() => {
        setIsSaving(true);

        dispatch(
            fillContributionsWithTemplate({
                templateID: id,
            }),
        ).then(() => {
            toast.success('Template added successfully');
            ref.current?.removeAttribute('disabled');
            setIsSaving(false);
        });
    }, [dispatch, id]);

    const deleteTemplate = useCallback(() => {
        setIsSaving(true);
        // Remove the properties related to the template if they have no values
        dispatch(removeEmptyPropertiesOfClass({ classId }));
        dispatch(removeClassFromContributionResource({ classId }))
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TemplateTooltip id={id}>
            <span tabIndex="0">
                <Button
                    innerRef={ref}
                    onClick={() => {
                        ref.current.setAttribute('disabled', 'disabled');
                        if (addMode) {
                            addTemplate();
                        } else {
                            deleteTemplate();
                        }
                    }}
                    size="sm"
                    color={addMode ? 'light' : 'danger'}
                    className="me-2 mb-2 position-relative px-3 rounded-pill border-0"
                >
                    <IconWrapper addMode={addMode}>
                        {!isSaving && addMode && <FontAwesomeIcon size="sm" icon={faPlus} />}
                        {!isSaving && !addMode && <FontAwesomeIcon size="sm" icon={faTimes} />}
                        {isSaving && <FontAwesomeIcon icon={faSpinner} spin />}
                    </IconWrapper>
                    <Label>{label}</Label>
                </Button>
            </span>
        </TemplateTooltip>
    );
};

TemplateButton.propTypes = {
    addMode: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    classId: PropTypes.string,
};

export default TemplateButton;
