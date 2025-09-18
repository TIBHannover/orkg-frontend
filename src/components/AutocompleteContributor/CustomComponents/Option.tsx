import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';

import { StyledGravatar } from '@/components/UserAvatar/UserAvatar';
import { Contributor } from '@/services/backend/types';

const Option = ({ data, isSelected, ...innerProps }: OptionProps<Contributor, false, GroupBase<Contributor>>) => (
    <components.Option data={data} isSelected={isSelected} {...innerProps}>
        <div className="d-flex align-items-center">
            <StyledGravatar className="rounded-circle me-2" hashedEmail={data.gravatar_id ?? 'example@example.com'} size={20} />
            <div>{data.display_name}</div>
        </div>
    </components.Option>
);

export default Option;
