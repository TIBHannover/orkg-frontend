import { GregorianType } from 'constants/DataTypes';

export type GregorianValues = {
    year: string;
    month: string;
    day: string;
};

export const monthsOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2000, i).toLocaleString('default', { month: 'long' });
    return { value: month, label: `${month} - ${monthName}` };
});

export const daysOptions = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
});

export const parseGregorianString = (value: string, type: GregorianType): GregorianValues | null => {
    let match;
    switch (type) {
        case 'gYear':
            match = value.match(/^(\d{4})$/);
            if (match) {
                return { year: match[1], month: '', day: '' };
            }
            break;
        case 'gMonth':
            match = value.match(/^--(\d{2})$/);
            if (match) {
                return { year: '', month: match[1], day: '' };
            }
            break;
        case 'gDay':
            match = value.match(/^---(\d{2})$/);
            if (match) {
                return { year: '', month: '', day: match[1] };
            }
            break;
        case 'gYearMonth':
            match = value.match(/^(\d{4})-(\d{2})$/);
            if (match) {
                return { year: match[1], month: match[2], day: '' };
            }
            break;
        case 'gMonthDay':
            match = value.match(/^--(\d{2})-(\d{2})$/);
            if (match) {
                return { year: '', month: match[1], day: match[2] };
            }
            break;
        default:
            break;
    }
    return null;
};

export const formatGregorianValue = (date: GregorianValues, type: GregorianType): string => {
    switch (type) {
        case 'gYear':
            return date.year;
        case 'gMonth':
            return `--${date.month.padStart(2, '0')}`;
        case 'gDay':
            return `---${date.day.padStart(2, '0')}`;
        case 'gYearMonth':
            return `${date.year}-${date.month.padStart(2, '0')}`;
        case 'gMonthDay':
            return `--${date.month.padStart(2, '0')}-${date.day.padStart(2, '0')}`;
        default:
            return '';
    }
};
