import { StoryFn } from '@storybook/nextjs';
import { useState } from 'react';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { ENTITIES } from '@/constants/graphSettings';

export default {
    title: 'Input/Autocomplete',
    component: Autocomplete,
    argTypes: {
        onChange: { action: 'onChange' },
    },
};

const Template: StoryFn<typeof Autocomplete> = (args) => {
    const [value, setValue] = useState<SingleValue<OptionType>>(null);

    return (
        <Autocomplete
            {...args}
            isMulti={false}
            onChange={(newValue, actionMeta) => {
                setValue(newValue as OptionType);
            }}
            value={value}
        />
    );
};

export const Default = Template.bind({});

export const ExternalSources = Template.bind({});

ExternalSources.args = {
    enableExternalSources: true,
};

export const IncludeClasses = Template.bind({});

IncludeClasses.args = {
    // List of include classes is not supported yet!
    includeClasses: ['Paper'],
    entityType: ENTITIES.RESOURCE,
};

export const ExcludeClasses = Template.bind({});

ExcludeClasses.args = {
    excludeClasses: ['Contribution'],
    entityType: ENTITIES.RESOURCE,
};

export const AdditionalOptions = Template.bind({});

AdditionalOptions.args = {
    additionalOptions: [{ id: 'test', label: 'TEST 1' }],
    entityType: ENTITIES.RESOURCE,
};
