import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SelectGlobalStyle, customClassNames, customStyles } from 'components/Autocomplete/styled';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import SelectOption from 'components/RosettaStone/AddStatement/SelectOption';
import NewStatementTypeModal from 'components/RosettaStone/NewStatementTypeModal/NewStatementTypeModal';
import RosettaTemplateEditorProvider from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { StyledButton } from 'components/StatementBrowser/styled';
import { FC, useId, useState } from 'react';
import type { GroupBase, OptionsOrGroups } from 'react-select';
import { ActionMeta, SingleValue } from 'react-select';
import { withAsyncPaginate } from 'react-select-async-paginate';
import Creatable from 'react-select/creatable';
import { ButtonGroup, InputGroup } from 'reactstrap';
import { getRSTemplates } from 'services/backend/rosettaStone';
import { RosettaStoneTemplate } from 'services/backend/types';

type AdditionalType = {
    page: number;
};

const AsyncPaginateCreatable = withAsyncPaginate(Creatable);

type AddStatementProps = {
    handleAddStatement: (templateId: string) => void;
};

const PAGE_SIZE = 12;

const AddStatement: FC<AddStatementProps> = ({ handleAddStatement }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialLabel, setInitialLabel] = useState('');

    const loadOptions = async (
        search: string,
        prevOptions: OptionsOrGroups<RosettaStoneTemplate, GroupBase<RosettaStoneTemplate>>,
        additional?: AdditionalType,
    ) => {
        const page = additional?.page ?? 1;
        const responseItems: RosettaStoneTemplate[] = [];
        let hasMore = false;

        const orkgResponseItems = await getRSTemplates({ q: search, page, size: PAGE_SIZE });

        if ('content' in orkgResponseItems) {
            responseItems.push(...(orkgResponseItems?.content ?? []));
            hasMore = !orkgResponseItems.last;
        }

        return {
            options: responseItems,
            hasMore,
            additional: {
                page: page + 1,
            },
        };
    };
    const instanceId = useId();

    const defaultAdditional = {
        page: 0,
    };

    const onChange = async (value: SingleValue<RosettaStoneTemplate>, actionMeta: ActionMeta<RosettaStoneTemplate>) => {
        if (actionMeta.action === 'create-option') {
            setInitialLabel(value?.label ?? '');
            setIsModalOpen(true);
            setShowAdd(false);
        } else if (value?.id) {
            await handleAddStatement(value?.id);
            setShowAdd(false);
        }
    };

    return (
        <div>
            {!showAdd ? (
                <ButtonGroup>
                    <ButtonWithLoading color="secondary" onClick={() => setShowAdd(true)}>
                        <FontAwesomeIcon className="icon" icon={faPlus} /> Add statement
                    </ButtonWithLoading>
                </ButtonGroup>
            ) : (
                <InputGroup>
                    <span className="input-group-text">
                        <FontAwesomeIcon className="icon" icon={faPlus} />
                    </span>

                    <SelectGlobalStyle />
                    <AsyncPaginateCreatable<RosettaStoneTemplate, GroupBase<RosettaStoneTemplate>, AdditionalType, false>
                        instanceId={instanceId}
                        classNamePrefix="react-select"
                        // @ts-expect-error different type from OptionType
                        styles={customStyles}
                        classNames={customClassNames}
                        debounceTimeout={300}
                        loadOptions={loadOptions}
                        additional={defaultAdditional}
                        getOptionValue={({ id }) => id}
                        isMulti={false}
                        components={{ Option: SelectOption }}
                        onChange={onChange}
                        formatCreateLabel={(inputValue: string) => `Create new statement type "${inputValue}"`}
                        placeholder="Search statement type by verb/predicate (e.g., has measurement, develops from) or define a new one"
                        createOptionPosition="first"
                        autoFocus
                        openMenuOnFocus
                        isValidNewOption={(val: string) => {
                            if (val) {
                                return true;
                            }
                            return false;
                        }}
                    />
                    <StyledButton className="w-auto" outline onClick={() => setShowAdd(false)}>
                        Cancel
                    </StyledButton>
                </InputGroup>
            )}
            <RosettaTemplateEditorProvider>
                <NewStatementTypeModal
                    initialLabel={initialLabel}
                    handleStatementSelect={handleAddStatement}
                    isOpen={isModalOpen}
                    toggle={() => {
                        setIsModalOpen((v) => !v);
                    }}
                />
            </RosettaTemplateEditorProvider>
        </div>
    );
};

export default AddStatement;
