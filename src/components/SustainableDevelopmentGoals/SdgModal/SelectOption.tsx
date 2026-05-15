import Image from 'next/image';
import { FC } from 'react';
import { components, OptionProps } from 'react-select';

import { getImage, getSdgNumber } from '@/components/SustainableDevelopmentGoals/helpers';
import { OptionType } from '@/components/SustainableDevelopmentGoals/SdgModal/SdgModal';

const SelectOption: FC<OptionProps<OptionType, false>> = ({ children, data, ...props }) => (
    <components.Option data={data} {...props}>
        <div className="flex items-center gap-2">
            <Image
                src={getImage(data.id)}
                style={{ width: 45, height: 'auto' }}
                className="rounded shrink-0"
                alt={`Sustainable Development Goals ${getSdgNumber(data.id)}`}
            />
            <span>
                {data.id.replace('SDG_', '')}. {children}
            </span>
        </div>
    </components.Option>
);

export default SelectOption;
