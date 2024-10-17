import { OptionType } from 'components/Autocomplete/types';
import Link from 'next/link';
import { ENTITIES } from 'constants/graphSettings';
import { FC, Fragment } from 'react';
import { PropertyShape } from 'services/backend/types';
import { getLinkByEntityType } from 'utils';

type StatementValueProps = {
    value: OptionType[];
    propertyShape: PropertyShape;
};

const StatementValue: FC<StatementValueProps> = ({ value, propertyShape }) => {
    if (!value || value?.length === 0) {
        return <u>{propertyShape.placeholder}</u>;
    }

    return (
        <span>
            {value.map((v, i) => (
                <Fragment key={`v${i}`}>
                    {'datatype' in v && <span>{v.label}</span>}
                    {!('datatype' in v) && (
                        <Link href={getLinkByEntityType(ENTITIES.RESOURCE, v.id)} target="_blank">
                            {v?.label}
                        </Link>
                    )}
                    {i + 1 < value.length - 1 && ', '}
                    {i + 2 === value.length && ' and '}
                </Fragment>
            ))}
        </span>
    );
};

export default StatementValue;
