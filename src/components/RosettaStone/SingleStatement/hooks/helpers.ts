import { ReactNode } from 'react';

import { RosettaStoneStatement } from '@/services/backend/types';

export const removeEmptySegments = (label: string, s?: RosettaStoneStatement) => {
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

    const processedLabel = _label
        .replace(/\[([^\]]*?{(\d+)}[^\]]*?)\]/g, (match, p1, p2) => {
            // p2 is the index
            const i = parseInt(p2, 10);
            const value = i === 0 ? s?.subjects : s?.objects[i - 1];
            return !value || value.length === 0 ? '' : match;
        })
        .replace(/\[\]/g, ''); // This part will clean up any leftover empty square brackets if any.

    // Replace bracket boundaries with proper spacing
    // ][  ->  space between segments
    // ]   ->  remove closing bracket
    // [   ->  remove opening bracket
    return processedLabel
        .replace(/\]\s*\[/g, ' ') // Replace ']....[' with single space (segment boundaries)
        .replace(/\]/g, '') // Remove remaining closing brackets
        .replace(/\[/g, '') // Remove remaining opening brackets
        .replace(/\s+/g, ' ') // Normalize all whitespace sequences to single spaces
        .trim(); // Remove leading and trailing whitespace
};

/**
 * Normalizes spacing in a mixed array of strings and React elements
 * Similar to the Kotlin implementation's approach:
 * 1. Filter out null/empty values
 * 2. Join with spaces
 * 3. Normalize all whitespace sequences to single spaces
 */
export const normalizeSpacing = (elements: ReactNode[]): ReactNode[] => {
    // Filter out null/undefined elements and empty strings
    const filteredElements = elements.filter((element) => {
        if (element == null) return false;
        if (typeof element === 'string' && element.trim() === '') return false;
        return true;
    });

    // If we have no elements, return empty array
    if (filteredElements.length === 0) return [];

    // Build the result with proper spacing
    const result: ReactNode[] = [];

    for (let i = 0; i < filteredElements.length; i += 1) {
        const element = filteredElements[i];

        // Add space before non-first elements
        if (i > 0) {
            result.push(' ');
        }

        if (typeof element === 'string') {
            // Normalize whitespace within the string
            const normalizedText = element.replace(/\s+/g, ' ').trim();
            if (normalizedText) {
                result.push(normalizedText);
            }
        } else {
            // Keep React elements as-is
            result.push(element);
        }
    }

    return result;
};
