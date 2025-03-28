import Image from 'next/image';
import { FC } from 'react';
import { components, OptionProps } from 'react-select';

import { getImage, getSdgNumber } from '@/components/SustainableDevelopmentGoals/helpers';
import { OptionType } from '@/components/SustainableDevelopmentGoals/SdgModal/SdgModal';

const SelectOption: FC<OptionProps<OptionType, false>> = ({ children, data, ...props }) => (
    <components.Option data={data} {...props}>
        <Image
            src={getImage(data.id)}
            style={{ width: 45, height: 'auto' }}
            className="rounded"
            alt={`Sustainable Development Goals ${getSdgNumber(data.id)}`}
        />
        <span className="ms-2">
            {data.id.replace('SDG_', '')}. {children}
        </span>
    </components.Option>
);

export default SelectOption;
