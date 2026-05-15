import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { useMeasure } from 'react-use';

import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { LiteralThingReference } from '@/services/backend/types';

type CellLiteralProps = {
    literal: LiteralThingReference;
};

const CellLiteral = ({ literal }: CellLiteralProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [ref, { height }] = useMeasure<HTMLDivElement>();

    let showButton = false;

    if (height >= 200) {
        showButton = true;
    }

    return (
        <>
            <div ref={ref} className="overflow-hidden" style={{ maxHeight: isExpanded ? 'initial' : 200 }}>
                <span>
                    <ValuePlugins type="literal" options={{ isModal: true }}>
                        {literal.label}
                    </ValuePlugins>
                </span>
            </div>
            {showButton && (
                <Button variant="ghost" size="sm" className="mt-1 border-0" onPress={() => setIsExpanded((v) => !v)}>
                    {isExpanded ? 'Show less' : 'Show more'}{' '}
                    <FontAwesomeIcon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} className="text-muted" />
                </Button>
            )}
        </>
    );
};

export default CellLiteral;
