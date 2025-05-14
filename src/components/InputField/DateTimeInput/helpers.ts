export type DateTimeValues = {
    year: string;
    month: string;
    day: string;
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
    timezone: string;
};

export const parseDateTimeString = (value: string): DateTimeValues | null => {
    if (!value) return null;

    const regex = new RegExp(
        `^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T` +
            `([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])` +
            `(?:\\.(\\d{1,3}))?(Z|(?:[+-](?:[01][0-9]|2[0-3]):[0-5][0-9]))?$`,
    );
    const matches = value.match(regex);

    if (matches) {
        const timezone = matches[8] || '';
        return {
            year: matches[1] || '',
            month: matches[2] || '',
            day: matches[3] || '',
            hours: matches[4] || '',
            minutes: matches[5] || '',
            seconds: matches[6] || '',
            milliseconds: matches[7] || '',
            timezone,
        };
    }
    return null;
};

export const formatDateTimeValue = (dateTime: DateTimeValues): string => {
    let result = '';

    const formatValue = (value: string, length: number = 2): string => {
        if (!value) return '';
        // Convert to number and back to string to remove leading zeros
        const numValue = parseInt(value, 10);
        // Pad with zeros to desired length
        return numValue.toString().padStart(length, '0');
    };

    // Date part
    if (dateTime.year) {
        result += `${formatValue(dateTime.year, 4)}-`;
        result += `${formatValue(dateTime.month)}-`;
        result += `${formatValue(dateTime.day)}`;
    }

    // Time part
    if (dateTime.hours || dateTime.minutes || dateTime.seconds) {
        result += 'T';
        result += `${formatValue(dateTime.hours)}:`;
        result += `${formatValue(dateTime.minutes)}:`;
        result += `${formatValue(dateTime.seconds)}`;
    }

    // Milliseconds - only add if between 1-3 digits
    if (dateTime.milliseconds && /^\d{1,3}$/.test(dateTime.milliseconds)) {
        result += `.${formatValue(dateTime.milliseconds, 3)}`;
    }

    // Timezone - only add if it exists in the input
    if (dateTime.timezone) {
        result += dateTime.timezone;
    }

    return result;
};
