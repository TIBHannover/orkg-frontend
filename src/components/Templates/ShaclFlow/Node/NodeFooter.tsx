import { faLock, faLockOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Tooltip } from '@heroui/react';
import { FC } from 'react';

import useCountInstances from '@/components/Class/hooks/useCountInstances';
import { Node } from '@/services/backend/types';

type NodeFooterProps = {
    isClosed: boolean;
    targetClass: Node;
};

const NodeFooter: FC<NodeFooterProps> = ({ isClosed, targetClass }) => {
    const { countInstances, isLoading: isLoadingCount } = useCountInstances(targetClass.id);
    return (
        <div className="bg-border text-secondary-darker rounded-b-[4px] text-xs px-2 py-1 flex justify-between items-center">
            <Tooltip>
                <Tooltip.Trigger>
                    <FontAwesomeIcon icon={isClosed ? faLock : faLockOpen} />
                </Tooltip.Trigger>
                <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    {isClosed
                        ? 'This template is closed (users cannot add additional properties)'
                        : 'This template is open (users can add additional properties)'}
                </Tooltip.Content>
            </Tooltip>
            <Tooltip>
                <Tooltip.Trigger>
                    <Chip size="sm" variant="soft">
                        {!isLoadingCount ? countInstances : <FontAwesomeIcon spin icon={faSpinner} />}
                    </Chip>
                </Tooltip.Trigger>
                <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    Number of instances
                </Tooltip.Content>
            </Tooltip>
        </div>
    );
};

export default NodeFooter;
