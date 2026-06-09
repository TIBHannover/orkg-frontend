'use client';

import { useState } from 'react';

import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';

type ReadMoreProps = {
    text?: string;
    maxLength?: number;
};

export default function ReadMore({ text = '', maxLength = 750 }: ReadMoreProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const textSliced = isExpanded ? text : text.slice(0, maxLength);
    const isExpandable = text.length > maxLength;
    return (
        <p>
            <ValuePlugins type={ENTITIES.LITERAL}>{textSliced}</ValuePlugins>
            {isExpandable && (
                <>
                    {!isExpanded ? '...' : ''}{' '}
                    <button
                        type="button"
                        aria-expanded={isExpanded}
                        className="text-accent hover:underline underline-offset-2 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        Show {isExpanded ? 'less' : 'more'}
                    </button>
                </>
            )}
        </p>
    );
}
