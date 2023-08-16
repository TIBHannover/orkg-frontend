import AutoComplete from 'components/Autocomplete/Autocomplete';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { Button, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';

const ResearchFieldInput = ({ value = '', onChange, inputId = '', isDisabled = false, title = '', abstract = '' }) => {
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);
    const [inputValue, setInputValue] = useState(null);

    const handleSelectField = ({ id, label }) => {
        onChange({
            id,
            label,
        });
    };

    return (
        <InputGroup>
            <AutoComplete
                inputId={inputId}
                allowCreate={false}
                ols={false}
                autoFocus={false}
                entityType={ENTITIES.RESOURCE}
                optionsClass={CLASSES.RESEARCH_FIELD}
                onChange={onChange}
                cacheOptions
                value={value || null}
                isClearable={false}
                onBlur={() => setInputValue('')}
                onChangeInputValue={e => setInputValue(e)}
                inputValue={inputValue}
                isDisabled={isDisabled}
            />

            <Button disabled={isDisabled} color="primary" outline onClick={() => setIsOpenResearchFieldModal(true)}>
                Choose
            </Button>

            {isOpenResearchFieldModal && (
                <ResearchFieldSelectorModal
                    isOpen
                    toggle={() => setIsOpenResearchFieldModal(v => !v)}
                    onSelectField={handleSelectField}
                    title={title}
                    abstract={abstract}
                />
            )}
        </InputGroup>
    );
};

ResearchFieldInput.propTypes = {
    inputId: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    title: PropTypes.string,
    abstract: PropTypes.string,
};

export default ResearchFieldInput;
