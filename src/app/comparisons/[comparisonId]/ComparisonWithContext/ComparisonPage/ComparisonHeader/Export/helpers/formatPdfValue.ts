import { parseDurationString } from '@/components/InputField/DurationInput/helpers';
import { parseGregorianString } from '@/components/InputField/GregorianInput/helpers';
import { isCodeValue } from '@/components/ValuePlugins/Code/Code';
import { isDurationValue } from '@/components/ValuePlugins/Duration/Duration';
import { isGregorianValue } from '@/components/ValuePlugins/Gregorian/Gregorian';
import { isImageValue } from '@/components/ValuePlugins/Images/ImageAsFigures';
import { isMathValue } from '@/components/ValuePlugins/Math/Math';
import { GregorianType } from '@/constants/DataTypes';
import { ThingReference } from '@/services/backend/types';

const MATH_EXPRESSION = /\${2}(.*?)\${2}/g;

const extractMapCoordinates = (text: string): [number, number] | null => {
    if (!text?.startsWith('Point(') || !text.endsWith(')')) return null;

    const [longitude, latitude] = text.slice(6, -1).split(' ');
    if (!longitude || !latitude) return null;

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return [lat, lon];
};

const formatDuration = (text: string, datatype?: string): string | null => {
    if (!isDurationValue({ text, datatype })) return null;

    const duration = parseDurationString(text);
    if (!duration) return null;

    const parts: string[] = [];
    if (duration.years) parts.push(`${duration.years} year${duration.years === '1' ? '' : 's'}`);
    if (duration.months) parts.push(`${duration.months} month${duration.months === '1' ? '' : 's'}`);
    if (duration.days) parts.push(`${duration.days} day${duration.days === '1' ? '' : 's'}`);
    if (duration.hours) parts.push(`${duration.hours} hour${duration.hours === '1' ? '' : 's'}`);
    if (duration.minutes) parts.push(`${duration.minutes} minute${duration.minutes === '1' ? '' : 's'}`);
    if (duration.seconds) parts.push(`${duration.seconds} second${duration.seconds === '1' ? '' : 's'}`);

    return parts.length > 0 ? parts.join(', ') : null;
};

const formatGregorian = (text: string, datatype?: string): string | null => {
    if (!datatype || !isGregorianValue({ text, datatype })) return null;

    const date = parseGregorianString(text, datatype.slice(4) as GregorianType);
    if (!date) return null;

    const parts: string[] = [];
    if (date.year) parts.push(date.year);
    if (date.month) parts.push(new Date(2000, parseInt(date.month, 10) - 1).toLocaleString('default', { month: 'long' }));
    if (date.day) parts.push(date.day);

    return parts.length > 0 ? parts.join(' ') : null;
};

const formatMath = (text: string): string | null => {
    if (!isMathValue(text)) return null;
    return text.replace(MATH_EXPRESSION, '$1');
};

/**
 * Text-first PDF value formatting — mirrors ValuePlugins detection but outputs plain strings.
 * jspdf-autotable cannot render React/HTML (KaTeX, Leaflet, images, syntax highlighting).
 * Visual plugin rendering would need async image embedding and custom cell layout; searchable
 * text export stays reliable and keeps table pagination predictable.
 */
const formatPdfValue = (value?: ThingReference | null): string => {
    if (!value) return '';

    const text = value.label;
    const datatype = value._class === 'literal_ref' ? value.datatype : undefined;

    const lower = text.trim().toLowerCase();
    if (lower === 'true') return 'Yes';
    if (lower === 'false') return 'No';

    const coordinates = extractMapCoordinates(text);
    if (coordinates) {
        const [lat, lon] = coordinates;
        return `Map: ${lat}, ${lon}`;
    }

    if (value._class === 'literal_ref') {
        const duration = formatDuration(text, datatype);
        if (duration) return duration;

        const gregorian = formatGregorian(text, datatype);
        if (gregorian) return gregorian;

        const math = formatMath(text);
        if (math) return math;

        if (isImageValue(text)) return `Image: ${text}`;
        if (isCodeValue(text)) return `Code: ${text}`;
    }

    return text;
};

export default formatPdfValue;
