import { cn } from '@heroui/react';
import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';

import Gravatar from '@/components/Gravatar/Gravatar';
import { Contributor } from '@/services/backend/types';

const Option = ({ data, isSelected, ...innerProps }: OptionProps<Contributor, false, GroupBase<Contributor>>) => (
    <components.Option data={data} isSelected={isSelected} {...innerProps}>
        <div className="flex items-center">
            <Gravatar
                className="mr-2 cursor-pointer rounded-full border-2 border-default hover:border-primary"
                hashedEmail={data.gravatarId ?? 'example@example.com'}
                size={20}
            />
            <div className="min-w-0">
                <div className={cn(isSelected && 'text-accent-foreground')}>{data.displayName}</div>
                <div className={cn('text-xs', isSelected ? 'text-accent-foreground/70' : 'text-muted')}>{data.id}</div>
            </div>
        </div>
    </components.Option>
);

export default Option;
