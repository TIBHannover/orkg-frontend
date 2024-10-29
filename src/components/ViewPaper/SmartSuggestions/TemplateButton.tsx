import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import { FC, useContext, useState } from 'react';
import { getResource, resourcesUrl, updateResource } from 'services/backend/resources';
import { Template } from 'services/backend/types';
import styled, { ThemeContext } from 'styled-components';
import useSWR from 'swr';

type IconWrapperProps = {
    $wrappercolor: string;
    $wrapperbackgroundcolor: string;
};

const IconWrapper = styled.span<IconWrapperProps>`
    background-color: ${(props) => props.$wrapperbackgroundcolor};
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
    color: ${(props) => props.$wrappercolor};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

type TemplateButtonProps = {
    template: Template;
    isSmart?: boolean;
    isDisabled?: boolean;
    resourceId: string;
};

const TemplateButton: FC<TemplateButtonProps> = ({ template, isSmart = false, isDisabled, resourceId }) => {
    const [isSaving, setIsSaving] = useState(false);

    const { data: resource, mutate } = useSWR([resourceId, resourcesUrl, 'getResource'], ([params]) => getResource(params));

    const theme = useContext(ThemeContext);
    const addTemplate = async () => {
        setIsSaving(true);
        if (resource && 'classes' in resource) {
            await updateResource(resourceId, undefined, [...(resource.classes ?? []), template.target_class.id]);
            // revalidate the cache of the selected contribution
            mutate();
        }
        setIsSaving(false);
    };

    const deleteTemplate = async () => {
        setIsSaving(true);
        if (resource && 'classes' in resource) {
            await updateResource(resourceId, undefined, [...(resource.classes.filter((c) => c !== template.target_class.id) ?? [])]);
            // revalidate the cache of the selected contribution
            mutate();
        }
        setIsSaving(false);
    };

    const addMode = (resource && 'classes' in resource && !resource?.classes?.includes(template.target_class.id)) || isDisabled;

    let color = 'danger';
    let wrapperBackgroundColor = '#dc3545';
    const wrapperColor = addMode && !isSmart ? theme?.secondary : 'white';

    if (addMode) {
        color = isSmart ? 'smart' : 'light';
        wrapperBackgroundColor = isSmart ? theme?.smart : '#d1d5e4';
    }

    return (
        <TemplateTooltip id={template.id} disabled={isDisabled}>
            <span>
                <ButtonWithLoading
                    onClick={() => {
                        if (addMode) {
                            addTemplate();
                        } else {
                            deleteTemplate();
                        }
                    }}
                    isLoading={isSaving}
                    size="sm"
                    outline={isSmart}
                    color={color}
                    isDisabled={isDisabled}
                    className={`me-2 mb-2 position-relative px-3 rounded-pill ${!isSmart && 'border-0'}`}
                >
                    <IconWrapper $wrappercolor={wrapperColor} $wrapperbackgroundcolor={wrapperBackgroundColor}>
                        {!isSaving && addMode && <Icon size="sm" icon={faPlus} />}
                        {!isSaving && !addMode && <Icon size="sm" icon={faTimes} />}
                        {isSaving && <Icon icon={faSpinner} spin />}
                    </IconWrapper>
                    <Label>{template.label}</Label>
                </ButtonWithLoading>
            </span>
        </TemplateTooltip>
    );
};

export default TemplateButton;
