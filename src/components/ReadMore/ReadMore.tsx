'use client';

import { useState } from 'react';
import { Button } from 'reactstrap';

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
                    <Button color="link" className="p-0 m-0 border-0" variant="link" onClick={() => setIsExpanded(!isExpanded)}>
                        Read {isExpanded ? 'less' : 'more'}
                    </Button>
                </>
            )}
        </p>
    );
}
