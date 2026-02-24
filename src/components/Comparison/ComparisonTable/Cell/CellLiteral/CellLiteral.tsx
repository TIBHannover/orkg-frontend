import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useMeasure } from 'react-use';

import Button from '@/components/Ui/Button/Button';
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
            <div ref={ref} className="tw:overflow-hidden" style={{ maxHeight: isExpanded ? 'initial' : 200 }}>
                <span>
                    <ValuePlugins type="literal" options={{ isModal: true }}>
                        {literal.label}
                    </ValuePlugins>
                </span>
            </div>
            {showButton && (
                <Button color="secondary" outline size="sm" className="tw:mt-1 tw:border-0 " onClick={() => setIsExpanded((v) => !v)}>
                    {isExpanded ? 'Show less' : 'Show more'} <FontAwesomeIcon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                </Button>
            )}
        </>
    );
};

export default CellLiteral;
