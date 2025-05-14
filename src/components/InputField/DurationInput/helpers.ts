import { DurationType } from '@/constants/DataTypes';

export type DurationValues = {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
};

export const parseDurationString = (value: string): DurationValues | null => {
    if (!value) return null;

    const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
    const matches = value.match(regex);
    if (matches) {
        return {
            years: matches[1] || '',
            months: matches[2] || '',
            days: matches[3] || '',
            hours: matches[4] || '',
            minutes: matches[5] || '',
            seconds: matches[6] || '',
        };
    }
    return null;
};

export const formatDurationValue = (duration: DurationValues, type: DurationType = 'duration'): string => {
    let result = 'P';

    if (type === 'duration' || type === 'yearMonthDuration') {
        if (duration.years) result += `${duration.years}Y`;
        if (duration.months) result += `${duration.months}M`;
    }

    if (type === 'duration' || type === 'dayTimeDuration') {
        if (duration.days) result += `${duration.days}D`;

        const hasTime = duration.hours || duration.minutes || duration.seconds;
        if (hasTime) {
            result += 'T';
            if (duration.hours) result += `${duration.hours}H`;
            if (duration.minutes) result += `${duration.minutes}M`;
            if (duration.seconds) result += `${duration.seconds}S`;
        }
    }

    return result;
};
