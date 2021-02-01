import { Input } from 'reactstrap';
import PropTypes from 'prop-types';

export default function InputField(props) {
    let inputFormType = 'text';
    if (props.valueClass) {
        switch (props.valueClass.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    }

    return (
        <Input
            placeholder="Enter a value"
            name="literalValue"
            type={inputFormType}
            bsSize="sm"
            value={props.inputValue}
            onChange={(e, value) => props.setInputValue(e ? e.target.value : value)}
            innerRef={props.literalInputRef}
            invalid={!props.isValid}
            onKeyDown={props.onKeyDown}
            onBlur={props.onBlur}
            autoFocus
        />
    );
}

InputField.propTypes = {
    components: PropTypes.array.isRequired,
    valueClass: PropTypes.object,
    setInputValue: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    inputValue: PropTypes.string.isRequired,
    isValid: PropTypes.bool.isRequired,
    literalInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
