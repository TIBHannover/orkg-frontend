import { Input, InputGroupAddon } from 'reactstrap';
import PropTypes from 'prop-types';
import DATA_TYPES, { getConfigByType } from 'constants/DataTypes';
import { useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';

export default function InputField(props) {
    let isClassDatatype = false;
    let inputFormType = 'text';
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    if (props.valueClass?.id) {
        isClassDatatype = true;
        switch (props.valueClass.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    } else if (props.isLiteral) {
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
                    type="select"
                    name="datatype"
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
    return (
        <>
            {props.isLiteral && !isClassDatatype && (
                <>
                    {/*<InputGroupAddon addonType="append">Type</InputGroupAddon>*/}
                    <Input
                        bsSize="sm"
                        onChange={e => props.setInputDataType(e.target.value)}
                        value={props.inputDataType}
                        type="select"
                        name="datatype"
                        className="flex-grow-0 d-flex"
                        style={{ flexBasis: '105px', height: 'auto' }}
                    >
                        {DATA_TYPES.map(dt => (
                            <option key={dt.type} value={dt.type}>
                                {!isCurationAllowed ? dt.name : dt.type}
                            </option>
                        ))}
                    </Input>
                </>
            )}
            {Forms[inputFormType] || Forms.default}
        </>
    );
}

InputField.propTypes = {
    components: PropTypes.array.isRequired,
    valueClass: PropTypes.object,
    setInputValue: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    inputValue: PropTypes.string.isRequired,
    inputDataType: PropTypes.string.isRequired,
    setInputDataType: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isLiteral: PropTypes.bool.isRequired,
    literalInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
