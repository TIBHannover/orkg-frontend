import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import { Input } from 'reactstrap';

import DateTimeInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DateTimeInput/DateTimeInput';
import DurationInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DurationInput/DurationInput';
import GregorianInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/GregorianInput/GregorianInput';
import InputFieldModal from '@/components/DataBrowser/components/Body/ValueInputField/InputField/InputFieldModal';
import TimeInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/TimeInput/TimeInput';
import { getConfigByClassId, getConfigByType } from '@/constants/DataTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';

export default function InputField(props) {
    const { inputFieldModalIsOpen: isModalOpen, setInputFieldModalIsOpen: setIsModalOpen } = props;
    let inputFormType = 'text';
    let dataType = MISC.DEFAULT_LITERAL_DATATYPE;

    if (props.valueClass?.id) {
        const config = getConfigByClassId(props.valueClass.id);
        inputFormType = config.inputFormType;
        dataType = props.valueClass.id;
    } else if (props.inputDataType !== ENTITIES.RESOURCE) {
        const config = getConfigByType(props.inputDataType);
        inputFormType = config.inputFormType;
        dataType = props.inputDataType;
    }

    const Forms = {
        textarea: (
            <Textarea
                placeholder={props.placeholder ? props.placeholder : 'Enter a value'}
                name="literalValue"
                value={props.inputValue}
                onChange={(e, value) => props.setInputValue(e ? e.target.value : value)}
                onKeyDown={props.onKeyDown}
                ref={(tag) => {
                    if (props.literalInputRef) {
                        props.literalInputRef.current = tag;
                    }
                }}
                onBlur={props.onBlur}
                className="form-control"
                autoFocus
            />
        ),
        boolean: (
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
        ),
        empty: <Input value="Value not reported in paper" type="text" bsSize="sm" className="flex-grow-1 d-flex" disabled />,
        default: (
            <Input
                placeholder={props.placeholder ? props.placeholder : 'Enter a value'}
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
        ),
        duration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <DurationInput value={props.inputValue} onChange={props.setInputValue} />
            </InputFieldModal>
        ),
        yearMonthDuration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <DurationInput value={props.inputValue} onChange={props.setInputValue} type="yearMonthDuration" />
            </InputFieldModal>
        ),
        dayTimeDuration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <DurationInput value={props.inputValue} onChange={props.setInputValue} type="dayTimeDuration" />
            </InputFieldModal>
        ),
        gYearMonth: <GregorianInput value={props.inputValue} onChange={props.setInputValue} type="gYearMonth" />,
        gYear: <GregorianInput value={props.inputValue} onChange={props.setInputValue} type="gYear" />,
        gMonthDay: <GregorianInput value={props.inputValue} onChange={props.setInputValue} type="gMonthDay" />,
        gDay: <GregorianInput value={props.inputValue} onChange={props.setInputValue} type="gDay" />,
        gMonth: <GregorianInput value={props.inputValue} onChange={props.setInputValue} type="gMonth" />,
        dateTime: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <DateTimeInput value={props.inputValue} onChange={props.setInputValue} type="dateTime" />
            </InputFieldModal>
        ),
        dateTimeStamp: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <DateTimeInput value={props.inputValue} onChange={props.setInputValue} type="dateTimeStamp" />
            </InputFieldModal>
        ),
        time: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={props.inputValue}>
                <TimeInput value={props.inputValue} onChange={props.setInputValue} />
            </InputFieldModal>
        ),
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
    placeholder: PropTypes.string,
    literalInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
    inputFieldModalIsOpen: PropTypes.bool,
    setInputFieldModalIsOpen: PropTypes.func,
};
