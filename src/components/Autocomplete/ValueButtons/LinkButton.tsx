import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { OptionType } from 'components/Autocomplete/types';
import Link from 'next/link';
import { FC } from 'react';
import { SingleValue } from 'react-select';
import { getLinkByEntityType } from 'utils';

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
            className="btn btn-sm btn-outline-secondary align-items-center d-flex px-2"
        >
            <Tippy content={`Go to ${value._class?.replace('_ref', '')} page`}>
                <span>
                    <FontAwesomeIcon icon={faLink} size="sm" />
                </span>
            </Tippy>
        </Link>
    );
};

export default LinkButton;
