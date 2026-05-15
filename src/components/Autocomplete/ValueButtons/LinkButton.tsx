import Link from 'next/link';
import { FC } from 'react';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { getLinkByEntityType } from '@/utils';

type LinkButtonProps = {
    value: SingleValue<OptionType>;
};

const LinkButton: FC<LinkButtonProps> = ({ value }) => {
    if (!value) {
        return null;
    }

    return (
        <Link
            target="_blank"
            href={getLinkByEntityType(value._class || 'class', value.id)}
            className="inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 py-1.5 text-xs border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus:ring-secondary flex px-2"
        >
            <span>View</span>
        </Link>
    );
};

export default LinkButton;
