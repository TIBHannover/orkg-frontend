import { Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { getConfigByType } from 'constants/DataTypes';
import Textarea from 'react-textarea-autosize';

export default function InputField(props) {
    let inputFormType = 'text';

    if (props.valueClass?.id) {
        switch (props.valueClass.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    } else if (props.inputDataType !== 'object') {
        const config = getConfigByType(props.inputDataType);
        inputFormType = config.inputFormType;
    }

    const Forms = {
        textarea: (
            <Textarea
                placeholder="Enter a value"
                name="literalValue"
                value={props.inputValue}
                onChange={(e, value) => props.setInputValue(e ? e.target.value : value)}
                onKeyDown={props.onKeyDown}
                inputRef={props.literalInputRef}
                onBlur={props.onBlur}
                className="form-control"
                autoFocus
            />
        ),
        boolean: (
            <>
                <Input
                    onChange={(e, value) => props.setInputValue(e ? e.target.value : value)}
                    value={props.inputValue}
                    innerRef={props.literalInputRef}
                    type="select"
                    name="literalValue"
                    bsSize="sm"
                    className="flex-grow-1 d-flex"
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </Input>
            </>
        ),
        default: (
            <>
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
                    className="flex-grow d-flex"
                    onBlur={props.onBlur}
                    autoFocus
                />
            </>
        )
    };

    return <>{Forms[inputFormType] || Forms.default}</>;
}

InputField.propTypes = {
    valueClass: PropTypes.object,
    setInputValue: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    inputValue: PropTypes.string.isRequired,
    inputDataType: PropTypes.string.isRequired,
    isValid: PropTypes.bool.isRequired,
    literalInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
