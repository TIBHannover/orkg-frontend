import AutocompleteContentTypeTitle from 'components/AutocompleteContentTypeTitle/AutocompleteContentTypeTitle';
import ListItem from 'components/ViewPaper/EditDialog/ListItem';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { InputGroup } from 'reactstrap';

const TitleItem = ({ toggleItem, isExpanded, value, onChange, onOptionClick }) => (
    <ListItem toggleItem={toggleItem} label="Title *" open={isExpanded} value={truncate(value || '', { length: 60 })}>
        <InputGroup>
            <AutocompleteContentTypeTitle value={value} onChange={onChange} onOptionClick={onOptionClick} />
        </InputGroup>
    </ListItem>
);

TitleItem.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    toggleItem: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

TitleItem.defaultProps = {
    lookupOnMount: false,
};

export default TitleItem;
