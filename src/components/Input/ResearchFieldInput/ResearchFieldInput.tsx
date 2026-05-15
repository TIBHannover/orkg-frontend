import { Button } from '@heroui/react';
import { FC, useState } from 'react';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ResearchFieldSelectorModal from '@/components/ResearchFieldSelector/ResearchFieldSelectorModal';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Node } from '@/services/backend/types';

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
        <div className="flex items-stretch min-h-9">
            <div className="min-w-0 flex-1 [&_.react-select\\_\\_control]:!rounded-e-none">
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
            </div>

            <Button
                isDisabled={isDisabled}
                variant="secondary"
                size="sm"
                onPress={() => setIsOpenResearchFieldModal(true)}
                className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px shrink-0"
            >
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
        </div>
    );
};

export default ResearchFieldInput;
