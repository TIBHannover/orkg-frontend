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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// This new story demonstrate Thing entity type support and shows the unified autocomplete that can search across all entity types
export const ThingEntityType = Template.bind({});

ThingEntityType.args = {
    entityType: ENTITIES.THING,
    placeholder: 'Search across all entity types (Resources, Predicates, Classes, Literals)',
};
