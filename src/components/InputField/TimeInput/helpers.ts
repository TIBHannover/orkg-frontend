export type TimeValues = {
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
};

export const parseTimeString = (value: string): TimeValues | null => {
    if (!value) return null;

    const regex = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(?:\.(\d{1,3}))?$/;
    const matches = value.match(regex);

    if (matches) {
        return {
            hours: matches[1] || '',
            minutes: matches[2] || '',
            seconds: matches[3] || '',
            milliseconds: matches[4] || '',
        };
    }
    return null;
};

export const formatTimeValue = (time: TimeValues): string => {
    let result = '';

    if (time.hours || time.minutes || time.seconds) {
        const formatValue = (_value: string, defaultValue: string = '00') => {
            if (!_value) return defaultValue;
            // Convert to number and back to string to remove leading zeros
            const numValue = parseInt(_value, 10);
            // Ensure two digits for all values
            return numValue.toString().padStart(2, '0');
        };

        const hours = formatValue(time.hours);
        const minutes = formatValue(time.minutes);
        const seconds = formatValue(time.seconds);
        result = `${hours}:${minutes}:${seconds}`;
    }

    // Add milliseconds if present
    if (time.milliseconds) {
        const ms = parseInt(time.milliseconds, 10).toString().padStart(3, '0');
        result += `.${ms}`;
    }

    return result;
};
