import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';

import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';

type DisabledTooltipContentProps = {
    range?: Node;
    _class: string;
    canSwitchEntityType: boolean;
};

const DisabledTooltipContent: FC<DisabledTooltipContentProps> = ({ range, _class, canSwitchEntityType }) => {
    return (
        <div>
            {range || !canSwitchEntityType ? 'Type is determined by the template.' : 'Changing the type is not possible'}
            {range && _class === ENTITIES.RESOURCE && (
                <div>
                    Only instances of
                    <Link target="_blank" href={reverse(ROUTES.CLASS, { id: range.id })}>
                        {range.label}
                    </Link>{' '}
                    are valid.
                </div>
            )}
        </div>
    );
};

export default DisabledTooltipContent;
