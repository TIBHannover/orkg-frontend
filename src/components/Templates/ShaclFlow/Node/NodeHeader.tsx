import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type NodeHeaderProps = {
    label: string;
    id: string;
};

const NodeHeader: FC<NodeHeaderProps> = ({ label, id }) => {
    return (
        <div className="bg-secondary text-white p-2 flex rounded-t-[4px]">
            <ConditionalWrapper
                condition={label?.length > 40}
                // eslint-disable-next-line react/no-unstable-nested-components
                wrapper={(children: React.ReactNode) => (
                    <Tooltip>
                        <Tooltip.Trigger>{children}</Tooltip.Trigger>
                        <Tooltip.Content showArrow>
                            <Tooltip.Arrow />
                            {label}
                        </Tooltip.Content>
                    </Tooltip>
                )}
            >
                <div className="truncate inline-block mr-2 max-w-[300px]">{label}</div>
            </ConditionalWrapper>{' '}
            <Tooltip>
                <Tooltip.Trigger>
                    <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id })}>
                        <FontAwesomeIcon icon={faLink} />
                    </Link>
                </Tooltip.Trigger>
                <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    Go to template page
                </Tooltip.Content>
            </Tooltip>
        </div>
    );
};

export default NodeHeader;
