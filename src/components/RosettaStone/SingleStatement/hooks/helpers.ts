import { RosettaStoneStatement } from 'services/backend/types';

const removeEmptySegments = (label: string, s?: RosettaStoneStatement) => {
    let count = 0;
    // Add a space if there is no space after the second occurrence of ']' (the verb)
    const _label = label.replace(/]/g, (match, offset, string) => {
        count += 1;
        // Check if it's the second occurrence
        if (count === 2 && string[offset + 1] !== ' ') {
            return '] ';
        }
        return match;
    });
    return _label
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
