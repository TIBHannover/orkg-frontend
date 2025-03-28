import { sortBy, upperFirst } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select, { components, OptionProps, SingleValue } from 'react-select';

import { SectionTypeContainerStyled, SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useOntology from '@/components/PdfTextAnnotation/hooks/useOntology';
import useReview from '@/components/Review/hooks/useReview';
import { ReviewSection } from '@/services/backend/types';

type OptionType = {
    label: string | null;
    value: string | null;
    disabled?: boolean;
};

const Option: FC<OptionProps<OptionType, false>> = ({ children, ...props }) => <components.Option {...props}>{children}</components.Option>;

type SectionTypeProps = {
    type: string;
    section: ReviewSection;
    isDisabled: boolean;
    disabledTooltip?: string;
};

const SectionType: FC<SectionTypeProps> = ({ section, type, isDisabled = false, disabledTooltip = 'The type of this section cannot be changed' }) => {
    const [editMode, setEditMode] = useState(false);
    const [options, setOptions] = useState<OptionType[]>([]);
    const [typeValue, setTypeValue] = useState<OptionType>({
        label: null,
        value: null,
    });
    const { classes } = useOntology();
    const { updateSection } = useReview();

    useEffect(() => {
        if (options.length === 0) {
            const ontologyClasses = classes.map((_class) => ({
                label: upperFirst(_class.label),
                value: _class.iri,
            }));
            const additionalClasses = [
                {
                    label: 'Section',
                    value: null,
                },
                {
                    label: 'Resource',
                    value: 'resource',
                    disabled: true,
                },
                {
                    label: 'Property',
                    value: 'property',
                    disabled: true,
                },
                {
                    label: 'Comparison',
                    value: 'comparison',
                    disabled: true,
                },
                {
                    label: 'Visualization',
                    value: 'visualization',
                    disabled: true,
                },
                {
                    label: 'Ontology',
                    value: 'ontology',
                    disabled: true,
                },
            ];
            const _options = sortBy([...ontologyClasses, ...additionalClasses], 'label');
            setOptions(_options);
        }
    }, [classes, options]);

    useEffect(() => {
        if (type && options.length) {
            const selected = options.find((option) => option.value === type);
            if (!selected) {
                return;
            }
            setTypeValue(selected);
        }
    }, [type, options]);

    const handleBlur = () => {
        setEditMode(false);
    };

    const handleChange = (selected: SingleValue<OptionType>) => {
        setTypeValue({
            label: selected?.label ?? '',
            value: selected?.value ?? '',
        });

        updateSection(section.id, {
            heading: section.heading,
            text: section.text,
            class: selected?.value,
        });
    };

    return (
        <>
            {isDisabled && (
                <SectionTypeStyled disabled>
                    <Tooltip content={disabledTooltip}>
                        <span>{typeValue.label}</span>
                    </Tooltip>
                </SectionTypeStyled>
            )}

            {!isDisabled && !editMode && (
                <SectionTypeStyled className="focus-primary" onClick={() => setEditMode(true)} aria-label={`Section type: ${typeValue.label}`}>
                    {typeValue.label ?? 'Section'}
                </SectionTypeStyled>
            )}
            {editMode && (
                <SectionTypeContainerStyled>
                    <SelectGlobalStyle />
                    <Select<OptionType>
                        value={typeValue}
                        onChange={handleChange}
                        options={options}
                        components={{ Option }}
                        onBlur={handleBlur}
                        isOptionDisabled={(option) => option.disabled ?? false}
                        classNamePrefix="react-select"
                        blurInputOnSelect
                        autoFocus
                        openMenuOnFocus
                        aria-label="Select the section type"
                    />
                </SectionTypeContainerStyled>
            )}
        </>
    );
};

export default SectionType;
