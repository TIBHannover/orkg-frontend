import Autocomplete from 'components/Autocomplete/Autocomplete';
import { OptionType } from 'components/Autocomplete/types';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { FC, useState } from 'react';
import { SingleValue } from 'react-select';
import { Button, InputGroup } from 'reactstrap';
import { Node } from 'services/backend/types';

type ResearchFieldInputProps = {
    onChange: (field: Node) => void;
    value: SingleValue<OptionType>;
    inputId?: string;
    isDisabled?: boolean;
    title?: string;
    abstract?: string;
};

const ResearchFieldInput: FC<ResearchFieldInputProps> = ({ onChange, value = null, inputId = '', isDisabled = false, title = '', abstract = '' }) => {
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);

    return (
        <InputGroup>
            <Autocomplete
                inputId={inputId}
                enableExternalSources={false}
                entityType={ENTITIES.RESOURCE}
                includeClasses={[CLASSES.RESEARCH_FIELD]}
                onChange={(selected) => {
                    onChange({
                        id: (selected as SingleValue<OptionType>)?.id ?? '',
                        label: (selected as SingleValue<OptionType>)?.label ?? '',
                    });
                }}
                value={value || null}
                isClearable={false}
                isDisabled={isDisabled}
                allowCreate={false}
            />

            <Button disabled={isDisabled} color="primary" outline onClick={() => setIsOpenResearchFieldModal(true)}>
                Choose
            </Button>

            {isOpenResearchFieldModal && (
                <ResearchFieldSelectorModal
                    isOpen
                    toggle={() => setIsOpenResearchFieldModal((v) => !v)}
                    onSelectField={onChange}
                    title={title}
                    abstract={abstract}
                />
            )}
        </InputGroup>
    );
};

export default ResearchFieldInput;
