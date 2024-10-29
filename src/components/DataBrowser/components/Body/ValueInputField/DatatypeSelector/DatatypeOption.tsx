import Tippy from '@tippyjs/react';
import { DataType } from 'constants/DataTypes';
import type { GroupBase } from 'react-select';
import { OptionProps, components } from 'react-select';

const DatatypeOption = <OptionT extends DataType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: OptionProps<OptionT, IsMulti, Group>,
) => {
    const { data } = props;
    return (
        <components.Option {...props}>
            <Tippy content={data.tooltip} disabled={!data.tooltip}>
                <div>{data.name}</div>
            </Tippy>
        </components.Option>
    );
};

export default DatatypeOption;
