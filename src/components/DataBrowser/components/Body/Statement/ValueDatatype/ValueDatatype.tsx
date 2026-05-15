import { Chip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import DATA_TYPES from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Statement } from '@/services/backend/types';

type ValueDatatypeProps = {
    value: Statement['object'];
};

const ValueDatatype: FC<ValueDatatypeProps> = ({ value }) => {
    return (
        <>
            {value._class === ENTITIES.LITERAL && 'datatype' in value && (
                <small>
                    <Chip className="ml-1">{DATA_TYPES.find((dt) => dt.type === value.datatype)?.name ?? value.datatype}</Chip>
                </small>
            )}
            {value._class === ENTITIES.RESOURCE && 'classes' in value && value.classes && value.classes.length > 0 && (
                <small>
                    <Chip className="ml-1">
                        {value.classes
                            .map((c) => (
                                <DescriptionTooltip key={c} id={c} _class={ENTITIES.CLASS}>
                                    <Link target="_blank" style={{ color: '#60687a' }} href={reverse(ROUTES.CLASS, { id: c })}>
                                        {c}
                                    </Link>
                                </DescriptionTooltip>
                            ))
                            /* @ts-expect-error */
                            .reduce((prev, curr) => [prev, ', ', curr])}
                    </Chip>
                </small>
            )}
        </>
    );
};

export default ValueDatatype;
