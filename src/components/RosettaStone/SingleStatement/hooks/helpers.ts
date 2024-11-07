import { RosettaStoneStatement } from 'services/backend/types';

const removeEmptySegments = (label: string, s?: RosettaStoneStatement) => {
    return label
        .replace(/\[([^\]]*?{(\d+)}[^\]]*?)\]/g, (match, p1, p2) => {
            // p2 is the index
            const i = parseInt(p2, 10);
            const value = i === 0 ? s?.subjects : s?.objects[i - 1];
            return !value || value.length === 0 ? '' : match;
        })
        .replace(/\[\]/g, '') // This part will clean up any leftover empty square brackets if any.
        .replaceAll(']', '')
        .replaceAll('[', '');
};

export default removeEmptySegments;
