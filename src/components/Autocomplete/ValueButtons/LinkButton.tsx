import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { OptionType } from 'components/Autocomplete/types';
import Link from 'components/NextJsMigration/Link';
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
        // @ts-expect-error
        <Link
            target="_blank"
            href={getLinkByEntityType(value._class || 'class', value.id)}
            className="btn btn-sm btn-outline-secondary align-items-center d-flex px-2"
        >
            <Tippy content={`Go to ${value._class ?? 'class'} page`}>
                <span>
                    <Icon icon={faLink} size="sm" />
                </span>
            </Tippy>
        </Link>
    );
};

export default LinkButton;
