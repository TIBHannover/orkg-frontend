import AutoComplete from 'components/Autocomplete/Autocomplete';
import AuthorsInput from 'components/Utils/AuthorsInput';
import ListItem from 'components/ViewPaper/EditDialog/ListItem';
import { CLASSES } from 'constants/graphSettings';
import { truncate } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import { range } from 'utils';

const EditItem = props => {
    const EMPTY_LABEL = 'Empty';
    let input;
    let stringValue;

    if (props.type === 'text') {
        input = <Input value={props.value ? props.value : ''} onChange={props.onChange} />;
        stringValue = truncate(props.value ? props.value : '', { length: 60 });
    } else if (props.type === 'month') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
                {moment.months().map((el, index) => {
                    return (
                        <option value={index + 1} key={index + 1}>
                            {el}
                        </option>
                    );
                })}
            </Input>
        );
        stringValue = props.value ? moment(props.value, 'M').format('MMMM') : EMPTY_LABEL;
    } else if (props.type === 'year') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
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
        input = (
            <AutoComplete
                allowCreate
                requestUrl={resourcesUrl}
                optionsClass={CLASSES.VENUE}
                onChange={props.onChange}
                placeholder="Select or type to enter a venue"
                autoFocus
                cacheOptions
                value={props.value ? props.value : null}
                isClearable={true}
            />
        );
        stringValue = props.value ? truncate(props.value.label, { length: 60 }) : EMPTY_LABEL;
    } else if (props.type === 'researchField') {
        input = (
            <InputGroup>
                <AutoComplete
                    allowCreate={false}
                    requestUrl={resourcesUrl}
                    optionsClass={CLASSES.RESEARCH_FIELD}
                    onChange={props.onChange}
                    placeholder="Search or choose a research field"
                    autoFocus
                    cacheOptions
                    value={props.value ? props.value : null}
                    isClearable={false}
                />
                <InputGroupAddon addonType="append">
                    <Button color="darkblue">Choose</Button>
                </InputGroupAddon>
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
    type: PropTypes.oneOf(['text', 'month', 'year', 'authors', 'publishedIn', 'researchField']).isRequired,
    isLastItem: PropTypes.bool
};

EditItem.defaultProps = {
    isLastItem: false,
    value: ''
};

export default EditItem;
