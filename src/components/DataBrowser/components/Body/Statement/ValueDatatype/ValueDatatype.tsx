import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Badge from '@/components/Ui/Badge/Badge';
import DATA_TYPES from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Statement } from '@/services/backend/types';

type ValueDatatypeProps = {
    value: Statement['object'];
};

const ValueDatatype: FC<ValueDatatypeProps> = ({ value }) => {
    return (
        <>
            {value._class === ENTITIES.LITERAL && 'datatype' in value && (
                <small>
                    <Badge color="light" className="ms-1" title={value.datatype}>
                        {DATA_TYPES.find((dt) => dt.type === value.datatype)?.name ?? value.datatype}
                    </Badge>
                </small>
            )}
            {value._class === ENTITIES.RESOURCE && 'classes' in value && (
                <small>
                    <Badge color="light" className="ms-1">
                        {value.classes?.length > 0 &&
                            value.classes
                                .map((c) => (
                                    <DescriptionTooltip key={c} id={c} _class={ENTITIES.CLASS}>
                                        <Link target="_blank" style={{ color: '#60687a' }} href={reverse(ROUTES.CLASS, { id: c })}>
                                            {c}
                                        </Link>
                                    </DescriptionTooltip>
                                ))
                                /* @ts-expect-error */
                                .reduce((prev, curr) => [prev, ', ', curr])}
                    </Badge>
                </small>
            )}
        </>
    );
};

export default ValueDatatype;
