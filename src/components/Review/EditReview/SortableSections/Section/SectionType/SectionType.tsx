import { Key, ListBox, Select } from '@heroui/react';
import { sortBy, upperFirst } from 'lodash';
import { FC, useEffect, useState } from 'react';

import { SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useOntology from '@/components/PdfAnnotation/hooks/useOntology';
import useReview from '@/components/Review/hooks/useReview';
import { ReviewSection } from '@/services/backend/types';

// Sentinel key used in place of `null` for the generic "Section" option (HeroUI Select keys must be strings)
const SECTION_KEY = '__section__';

type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

type SectionTypeProps = {
    type: string;
    section: ReviewSection;
    isDisabled: boolean;
    disabledTooltip?: string;
};

const SectionType: FC<SectionTypeProps> = ({ section, type, isDisabled = false, disabledTooltip = 'The type of this section cannot be changed' }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const { classes } = useOntology();
    const { updateSection } = useReview();

    useEffect(() => {
        if (options.length === 0) {
            const ontologyClasses: Option[] = classes.map((_class) => ({
                label: upperFirst(_class.label),
                value: _class.iri,
            }));
            const additionalClasses: Option[] = [
                { label: 'Section', value: SECTION_KEY },
                { label: 'Resource', value: 'resource', disabled: true },
                { label: 'Property', value: 'property', disabled: true },
                { label: 'Comparison', value: 'comparison', disabled: true },
                { label: 'Visualization', value: 'visualization', disabled: true },
                { label: 'Ontology', value: 'ontology', disabled: true },
            ];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOptions(sortBy([...ontologyClasses, ...additionalClasses], 'label'));
        }
    }, [classes, options]);

    const currentKey = type || SECTION_KEY;
    const currentLabel = options.find((o) => o.value === currentKey)?.label ?? 'Section';
    const disabledKeys = options.filter((o) => o.disabled).map((o) => o.value);

    const handleChange = (key: Key | Key[] | null) => {
        const selectedKey = Array.isArray(key) ? key[0] : key;
        if (selectedKey == null) {
            return;
        }
        const nextClass = selectedKey === SECTION_KEY ? null : (selectedKey as string);
        updateSection(section.id, {
            heading: section.heading,
            text: section.text,
            class: nextClass,
        });
    };

    if (isDisabled) {
        return (
            <SectionTypeStyled disabled>
                <Tooltip content={disabledTooltip}>
                    <span>{currentLabel}</span>
                </Tooltip>
            </SectionTypeStyled>
        );
    }

    return (
        <div className="absolute right-[-6px] top-[-6px] z-10 min-w-[180px]">
            <Select fullWidth value={currentKey} onChange={handleChange} disabledKeys={disabledKeys} aria-label="Select the section type">
                <Select.Trigger className="!h-auto !min-h-0 !rounded-[3px] !border !border-[#c5cadb] !bg-[var(--background)] !px-[15px] !py-[1px] !text-[90%] !font-bold !uppercase !text-secondary !shadow-[0px_0px_8px_0px_rgba(0,0,0,0.13)]">
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {options.map((option) => (
                            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                                {option.label}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </div>
    );
};

export default SectionType;
