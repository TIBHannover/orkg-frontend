import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import { GlobalStyle } from 'components/Input/AuthorsInput/styled';
import ModalWithLoading from 'components/ModalWithLoading/ModalWithLoading';
import Goal from 'components/SustainableDevelopmentGoals/SdgModal/Sdg';
import SelectOption from 'components/SustainableDevelopmentGoals/SdgModal/SelectOption';
import { sortSdgs } from 'components/SustainableDevelopmentGoals/helpers';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from 'constants/graphSettings';
import { FC, useEffect, useState } from 'react';
import Select, { OnChangeValue } from 'react-select';
import { Button, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import { Node } from 'services/backend/types';
import styled from 'styled-components';

type SdgModalProps = {
    toggle: () => void;
    handleSave: (sdgs: Node[]) => void;
    sdgs?: Node[];
    isEditing?: boolean;
};

export type OptionType = {
    id: string;
    label: string;
};

export const List = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

const SdgModal: FC<SdgModalProps> = ({ toggle, sdgs = [], handleSave, isEditing = false }) => {
    const [sdgsLocal, setSdgsLocal] = useState(sortSdgs(sdgs));
    const [isAdding, setIsAdding] = useState(false);
    const [options, setOptions] = useState<OptionType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getOptions = async () => {
            setIsLoading(true);
            const sdgResources = await Promise.all(Object.values(SUSTAINABLE_DEVELOPMENT_GOALS).map((resourceId) => getResource(resourceId)));
            setOptions(sdgResources.map((resource) => ({ id: resource.id, label: resource.label })));
            setIsLoading(false);
        };
        getOptions();
    }, []);

    const handleDelete = (id: string) => setSdgsLocal((_sdgs) => _sdgs.filter((_sdg) => id !== _sdg.id));

    const handleSelect = (sdg: OnChangeValue<OptionType, false>) => {
        if (!sdg?.id) {
            return;
        }
        setSdgsLocal((_sdgs) => sortSdgs([..._sdgs, sdg]));
    };

    const handleSaveClick = async () => {
        setIsLoading(true);
        await handleSave(sdgsLocal);
        toggle();
    };

    return (
        <ModalWithLoading isOpen toggle={toggle} isLoading={isLoading}>
            <GlobalStyle />
            <ModalHeader toggle={toggle}>Sustainable Development Goals (SDGs)</ModalHeader>
            <ModalBody>
                <List>
                    {sdgsLocal.map((sdg) => (
                        <Goal
                            sdg={sdg}
                            label={options.find((option) => option.id === sdg.id)?.label || ''}
                            key={sdg.id}
                            onDelete={handleDelete}
                            isEditing={isEditing}
                        />
                    ))}
                </List>

                {isEditing && !isAdding && (
                    <Button color="light" onClick={() => setIsAdding(true)} className="w-100">
                        <FontAwesomeIcon icon={faPlus} /> Add goal
                    </Button>
                )}
                {isAdding && (
                    <>
                        <SelectGlobalStyle />
                        <Select
                            onChange={handleSelect}
                            options={options.filter(({ id }) => !sdgsLocal.find((sdg) => sdg.id === id))}
                            components={{ Option: SelectOption }}
                            onBlur={() => setIsAdding(false)}
                            classNamePrefix="react-select"
                            blurInputOnSelect
                            autoFocus
                            aria-label="Select an SDG"
                            defaultMenuIsOpen
                        />
                    </>
                )}
            </ModalBody>
            {isEditing && (
                <ModalFooter>
                    <Button color="light" onClick={toggle}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={handleSaveClick}>
                        Save
                    </Button>
                </ModalFooter>
            )}
        </ModalWithLoading>
    );
};

export default SdgModal;
