import AutoComplete from 'components/Autocomplete/Autocomplete';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import AuthorsInput from 'components/Utils/AuthorsInput';
import ListItem from 'components/ViewPaper/EditDialog/ListItem';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useState } from 'react';
import { Button, Input, InputGroup } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { range } from 'utils';
import Textarea from 'react-textarea-autosize';

const EditItem = props => {
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);
    const [inputValue, setInputValue] = useState(null);

    const EMPTY_LABEL = 'Empty';
    let input;
    let stringValue;

    if (props.type === 'text') {
        input = <Input value={props.value ? props.value : ''} onChange={props.onChange} />;
        stringValue = truncate(props.value ? props.value : '', { length: 60 });
    } else if (props.type === 'textarea') {
        input = <Textarea value={props.value ? props.value : ''} onChange={props.onChange} className="form-control" maxLength="3900" minRows="3" />;
        stringValue = truncate(props.value ? props.value : '', { length: 60 });
    } else if (props.type === 'month') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
                <option value="" key="">
                    Month
                </option>
                {moment.months().map((el, index) => (
                    <option value={index + 1} key={index + 1}>
                        {el}
                    </option>
                ))}
            </Input>
        );
        stringValue = props.value ? moment(props.value, 'M').format('MMMM') : EMPTY_LABEL;
    } else if (props.type === 'year') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
                <option value="" key="">
                    Year
                </option>
                {range(1900, moment().year())
                    .reverse()
                    .map(year => (
                        <option key={year}>{year}</option>
                    ))}
            </Input>
        );
        stringValue = props.value;
    } else if (props.type === 'authors') {
        input = <AuthorsInput value={props.value} handler={props.onChange} />;
        const authors = props.value.map(author => author.label);
        stringValue = authors.length > 2 ? `${authors.slice(0, 2).join(', ')} et al.` : authors.join(', ');
    } else if (props.type === 'publishedIn') {
        const handleChange = async (selected, action) => {
            if (action.action === 'select-option') {
                props.onChange(selected);
            } else if (action.action === 'create-option') {
                const newVenue = await createResource(selected.label, [CLASSES.VENUE]);
                props.onChange({
                    ...selected,
                    id: newVenue.id,
                });
            } else if (action.action === 'clear') {
                props.onChange({
                    ...selected,
                    id: null,
                    label: null,
                });
            }
        };

        input = (
            <AutoComplete
                allowCreate
                entityType={ENTITIES.RESOURCE}
                optionsClass={CLASSES.VENUE}
                onChange={handleChange}
                placeholder="Select or type to enter a venue"
                autoFocus
                cacheOptions
                value={props.value ? props.value : null}
                isClearable={true}
            />
        );
        stringValue = props.value ? truncate(props.value.label, { length: 60 }) : EMPTY_LABEL;
    } else if (props.type === 'researchField') {
        const handleSelectField = ({ id, label }) => {
            props.onChange({
                id,
                label,
            });
        };
        input = (
            <InputGroup>
                <AutoComplete
                    allowCreate={false}
                    entityType={ENTITIES.RESOURCE}
                    optionsClass={CLASSES.RESEARCH_FIELD}
                    onChange={props.onChange}
                    placeholder="Search or choose a research field"
                    autoFocus
                    cacheOptions
                    value={props.value ? props.value : null}
                    isClearable={false}
                    onBlur={() => setInputValue('')}
                    onChangeInputValue={e => setInputValue(e)}
                    inputValue={inputValue}
                />

                <Button color="secondary" onClick={() => setIsOpenResearchFieldModal(true)}>
                    Choose
                </Button>

                {isOpenResearchFieldModal && (
                    <ResearchFieldSelectorModal isOpen toggle={v => setIsOpenResearchFieldModal(v => !v)} onSelectField={handleSelectField} />
                )}
            </InputGroup>
        );
        stringValue = props.value && props.value.label ? props.value.label : EMPTY_LABEL;
    }

    return (
        <ListItem
            toggleItem={props.toggleItem}
            label={props.label}
            value={stringValue || EMPTY_LABEL}
            open={props.open}
            isLastItem={props.isLastItem}
        >
            {input}
        </ListItem>
    );
};

EditItem.propTypes = {
    open: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    toggleItem: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
    onChange: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['text', 'month', 'year', 'authors', 'publishedIn', 'researchField', 'textarea']).isRequired,
    isLastItem: PropTypes.bool,
};

EditItem.defaultProps = {
    isLastItem: false,
    value: '',
};

export default EditItem;
