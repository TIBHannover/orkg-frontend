import { FC, useEffect, useId, useState } from 'react';
import { Col, FormGroup, Input, Label } from 'reactstrap';

import { formatTimeValue, parseTimeString, TimeValues } from '@/components/InputField/TimeInput/helpers';

type TimeInputProps = {
    value: string;
    onChange: (value: string) => void;
};

const TimeInput: FC<TimeInputProps> = ({ value, onChange }) => {
    const [time, setTime] = useState<TimeValues>({
        hours: '',
        minutes: '',
        seconds: '',
        milliseconds: '',
    });
    const formId = useId();

    // Parse input string to object
    useEffect(() => {
        if (!value) return;
        const parsedTime = parseTimeString(value);
        if (parsedTime) {
            setTime(parsedTime);
        }
    }, [value]);

    const handleChange = (field: keyof TimeValues, newValue: string) => {
        const cleanValue = newValue.replace(/^0+/, '') || '';
        const newTime = { ...time, [field]: cleanValue };
        setTime(newTime);
        onChange(formatTimeValue(newTime));
    };

    return (
        <>
            <FormGroup row>
                <Label for={`${formId}hours`} sm={3}>
                    Hours
                </Label>
                <Col sm={9}>
                    <Input
                        id={`${formId}hours`}
                        placeholder="hh"
                        type="number"
                        min="0"
                        max="23"
                        value={time.hours}
                        onChange={(e) => handleChange('hours', e.target.value)}
                    />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for={`${formId}minutes`} sm={3}>
                    Minutes
                </Label>
                <Col sm={9}>
                    <Input
                        id={`${formId}minutes`}
                        placeholder="mm"
                        type="number"
                        min="0"
                        max="59"
                        value={time.minutes}
                        onChange={(e) => handleChange('minutes', e.target.value)}
                    />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for={`${formId}seconds`} sm={3}>
                    Seconds
                </Label>
                <Col sm={9}>
                    <Input
                        id={`${formId}seconds`}
                        placeholder="ss"
                        type="number"
                        min="0"
                        max="59"
                        value={time.seconds}
                        onChange={(e) => handleChange('seconds', e.target.value)}
                    />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label for={`${formId}milliseconds`} sm={3}>
                    Milliseconds
                </Label>
                <Col sm={9}>
                    <Input
                        id={`${formId}milliseconds`}
                        placeholder="sss"
                        type="number"
                        min="0"
                        max="999"
                        value={time.milliseconds}
                        onChange={(e) => handleChange('milliseconds', e.target.value)}
                    />
                </Col>
            </FormGroup>
        </>
    );
};

export default TimeInput;
