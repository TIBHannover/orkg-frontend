import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label, ListBox, Select as HeroSelect, Skeleton, toast, Tooltip } from '@heroui/react';
import { isString, upperFirst } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { Content, ScaledPosition } from 'react-pdf-highlighter';
import Select, { components, GroupBase, OptionProps } from 'react-select';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import useOntology, { CSVW_TABLE_IRI, OntologyClass, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import useSuggestions from '@/components/PdfAnnotation/hooks/useSuggestions';

const Option: FC<OptionProps<OntologyClass, boolean, GroupBase<OntologyClass>>> = ({ children, ...props }) => (
    <components.Option {...props}>
        <div className="flex items-center justify-between">
            <span>{children}</span>
            <Tooltip>
                <Tooltip.Trigger className="inline-flex" aria-label={props.data.comment}>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                </Tooltip.Trigger>
                <Tooltip.Content className="max-w-[300px]">{props.data.comment}</Tooltip.Content>
            </Tooltip>
        </div>
    </components.Option>
);

type AnnotationTooltipNewProps = {
    content: Content;
    position: ScaledPosition;
    hideTipAndSelection: () => void;
    handleAnnotate: ({
        content,
        position,
        type,
        view,
    }: {
        content: Content;
        position: ScaledPosition;
        type: string;
        view?: 'extraction' | 'validation';
    }) => void;
    transformSelection: () => void;
};

const AnnotationTooltipNew: FC<AnnotationTooltipNewProps> = ({ content, position, hideTipAndSelection, handleAnnotate, transformSelection }) => {
    const { classes, recommendedClasses } = useOntology();
    const { suggestedClasses, isLoading: suggestionsIsLoading } = useSuggestions({ sentence: content.text });
    const [type, setType] = useState<OntologyClass | null>(null);
    const [selectedTableType, setSelectedTableType] = useState<string>(SURVEY_TABLES_IRI);
    const [hasFocus, setHasFocus] = useState(false);

    const options: GroupBase<OntologyClass>[] = [
        {
            label: 'Recommended properties',
            options: recommendedClasses.map((_class) => ({
                ..._class,
                label: upperFirst(_class.label),
            })),
        },
        {
            label: 'All properties',
            options: classes.map((_class) => ({
                ..._class,
                label: upperFirst(_class.label),
            })),
        },
    ];

    const handleAnnotation = (value: string | null = null) => {
        if (!type && !value) {
            toast.danger('Please enter an annotation type');
            return;
        }
        const valueType = value ?? type?.iri;

        handleAnnotate({
            content: {
                ...content,
                text: isString(content.text) ? content.text.replace(/\s+/g, ' ').trim() : content.text,
            },
            position,
            type: valueType ?? '',
            view: undefined,
        });
        hideTipAndSelection();
    };

    const handleSuggestionClick = (value: string) => {
        handleAnnotation(value);
    };

    // used to transform the selection into highlight, to keep the selection when interacting with this tooltip
    const focusContainer = () => {
        if (!hasFocus) {
            setHasFocus(true);
        }
    };

    useEffect(() => {
        if (hasFocus) {
            transformSelection();
        }
    }, [hasFocus, transformSelection]);

    if (content.image) {
        return (
            <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        focusContainer();
                    }
                }}
                onClick={focusContainer}
                className="bg-foreground text-background p-2.5 rounded-md shadow-[0_0_5px_2px_rgb(0_0_0_/_15%)] cursor-pointer w-[260px]"
            >
                <p className="mb-2">Select table type, to extract the table from the PDF</p>
                <HeroSelect
                    fullWidth
                    name="tableType"
                    value={selectedTableType}
                    onChange={(value) => setSelectedTableType((value as string) ?? SURVEY_TABLES_IRI)}
                    className="mb-2 text-foreground"
                >
                    <Label className="sr-only" htmlFor="tableTypeSelect">
                        Table type
                    </Label>
                    <HeroSelect.Trigger id="tableTypeSelect" className="bg-surface text-foreground">
                        <HeroSelect.Value />
                        <HeroSelect.Indicator />
                    </HeroSelect.Trigger>
                    <HeroSelect.Popover>
                        <ListBox>
                            <ListBox.Item id={SURVEY_TABLES_IRI} textValue="Survey table">
                                Survey table
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id={CSVW_TABLE_IRI} textValue="Regular table">
                                Regular table
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        </ListBox>
                    </HeroSelect.Popover>
                </HeroSelect>
                <Button
                    variant="primary"
                    size="sm"
                    onPress={() => {
                        handleAnnotate({
                            content,
                            position,
                            type: selectedTableType,
                            view: 'extraction',
                        });
                        hideTipAndSelection();
                    }}
                >
                    Extract table
                </Button>
            </div>
        );
    }

    return (
        <div
            className="bg-foreground text-background p-2.5 rounded-md w-[430px] shadow-[0_0_5px_2px_rgb(0_0_0_/_15%)]"
            onClick={focusContainer}
            role="presentation"
        >
            <div className="mb-1">Select type</div>
            <div className="text-foreground">
                <Select<OntologyClass>
                    value={type}
                    onChange={(selected) => setType(selected)}
                    options={options}
                    components={{ Option }}
                    getOptionValue={(option) => option.iri}
                    classNamePrefix="react-select"
                    classNames={customClassNames as never}
                    styles={customStyles as never}
                    menuPosition="fixed"
                />
            </div>
            <div className="mt-2 mb-1">Smart suggestions</div>
            {!suggestionsIsLoading ? (
                <div className="min-h-[62px] flex flex-wrap gap-1">
                    {suggestedClasses && suggestedClasses?.length > 0 ? (
                        suggestedClasses.map((suggestion) => (
                            <Button
                                className="button--orkg-smart rounded-full py-0.5"
                                size="sm"
                                key={suggestion.iri}
                                onPress={() => handleSuggestionClick(suggestion.iri)}
                            >
                                {upperFirst(suggestion.label)}
                            </Button>
                        ))
                    ) : (
                        <span>No suggestions available</span>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="w-[20%] h-4 rounded bg-default-700" />
                    <Skeleton className="w-[20%] h-4 rounded bg-default-700" />
                    <Skeleton className="w-[20%] h-4 rounded bg-default-700" />
                    <Skeleton className="w-[20%] h-4 rounded bg-default-700" />
                    <Skeleton className="w-[20%] h-4 rounded bg-default-700" />
                </div>
            )}
            <hr className="my-2 border-white/25" />
            <div className="flex justify-center">
                <Button size="sm" variant="primary" onPress={() => handleAnnotation()}>
                    Annotate
                </Button>
            </div>
        </div>
    );
};

export default AnnotationTooltipNew;
