import { Alert, Checkbox } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type BioassayResource = {
    id: string;
    label: string;
};

type BioassayProperty = {
    id: string;
    label: string;
};

type BioassayLabel = {
    property: BioassayProperty;
    resources: BioassayResource[];
};

type BioassaySelectItemProps = {
    data: { labels: BioassayLabel[] };
    selectedItems: Record<string, string[]>;
    handleSelect: (label: BioassayLabel, resource: BioassayResource) => void;
};

const BioassaySelectItem: FC<BioassaySelectItemProps> = ({ data, selectedItems, handleSelect }) => (
    <div className="flex flex-col gap-3">
        <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Select items to include</Alert.Title>
                <Alert.Description>Please select specific items that you want to include in the contribution data.</Alert.Description>
            </Alert.Content>
        </Alert>
        <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
            {data.labels.map((labelKey) => (
                <div key={`p${labelKey.property.id}`} className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
                    <div className="bg-surface-secondary px-3 py-2 font-medium">
                        <Link
                            className="text-foreground hover:underline"
                            target="_blank"
                            href={reverse(ROUTES.PROPERTY, { id: labelKey.property.id })}
                        >
                            {labelKey.property.label}
                        </Link>
                    </div>
                    <ul className="bg-surface flex flex-col divide-y divide-border">
                        {labelKey.resources.map((resource) => (
                            <li key={`p${resource.id}`} className="flex items-center gap-2 px-3 py-2">
                                <div className="grow">
                                    <Link
                                        className="text-accent hover:underline"
                                        target="_blank"
                                        href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`}
                                    >
                                        {resource.label}
                                    </Link>
                                </div>
                                <Checkbox
                                    isSelected={!!selectedItems?.[labelKey.property.id]?.includes(resource.id)}
                                    onChange={() => handleSelect(labelKey, resource)}
                                    aria-label={`Select ${resource.label}`}
                                >
                                    <Checkbox.Content>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox.Content>
                                </Checkbox>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

export default BioassaySelectItem;
