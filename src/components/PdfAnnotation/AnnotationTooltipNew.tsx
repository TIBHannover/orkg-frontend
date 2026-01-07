import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isString, upperFirst } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { Content, ScaledPosition } from 'react-pdf-highlighter';
import Select, { components, GroupBase, OptionProps } from 'react-select';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useOntology, { CSVW_TABLE_IRI, OntologyClass, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import useSuggestions from '@/components/PdfAnnotation/hooks/useSuggestions';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';

const Container = styled.div`
    background: #333333;
    padding: 10px;
    border-radius: 6px;
    color: #fff;
    width: 430px;
    box-shadow: 0px 0px 5px 2px #c9c9c9;
`;

const StyledSelectOption = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Option: FC<OptionProps<OntologyClass, boolean, GroupBase<OntologyClass>>> = ({ children, ...props }) => (
    <components.Option {...props}>
        <StyledSelectOption>
            <span>{children}</span>
            <Tooltip content={props.data.comment} contentStyle={{ maxWidth: '300px' }}>
                <span>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                </span>
            </Tooltip>
        </StyledSelectOption>
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
            toast.error('Please enter an annotation type');
            return;
        }
        const valueType = value ?? type?.iri;

        handleAnnotate({
            content: {
                ...content,
                text: isString(content.text) ? content.text.replace(/\s+/g, ' ').trim() : content.text, // replace double white spaces that could occur when copying text from PDFs
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
                className="tw:bg-gray-800 tw:p-2.5 tw:rounded-md tw:text-white tw:shadow-[0px_0px_5px_2px_#c9c9c9] tw:cursor-pointer"
            >
                <p>Select table type, to extract the table from the PDF</p>
                <div className="mb-2">
                    <Input type="select" value={selectedTableType} onChange={(e) => setSelectedTableType(e.target.value)}>
                        <option value={SURVEY_TABLES_IRI}>Survey table</option>
                        <option value={CSVW_TABLE_IRI}>Regular table</option>
                    </Input>
                </div>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
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
        <Container onClick={focusContainer}>
            <div className="mb-1">Select type</div>

            <div style={{ color: '#000' }}>
                <Select<OntologyClass>
                    value={type}
                    onChange={(selected) => setType(selected)}
                    options={options}
                    components={{ Option }}
                    getOptionValue={(option) => option.iri}
                />
            </div>

            <div className="mt-2 mb-1">Smart suggestions</div>

            {!suggestionsIsLoading ? (
                <div style={{ minHeight: 62 }}>
                    {suggestedClasses && suggestedClasses?.length > 0 ? (
                        suggestedClasses.map((suggestion) => (
                            <Button
                                active={!!(type && type.iri === suggestion.iri)}
                                className="rounded-pill me-2 mb-1"
                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                size="sm"
                                color="smart"
                                key={suggestion.iri}
                                onClick={() => handleSuggestionClick(suggestion.iri)}
                            >
                                {upperFirst(suggestion.label)}
                            </Button>
                        ))
                    ) : (
                        <span>No suggestions available</span>
                    )}
                </div>
            ) : (
                <ContentLoader
                    height="100%"
                    width="100%"
                    viewBox="0 0 100 10"
                    style={{ width: '100% !important' }}
                    speed={2}
                    backgroundColor="#6f6b6b"
                    foregroundColor="#989393"
                >
                    <rect x="0" y="0" rx="1" ry="1" width="20" height="4" />
                    <rect x="24" y="0" rx="1" ry="1" width="20" height="4" />
                    <rect x="48" y="0" rx="1" ry="1" width="20" height="4" />
                    <rect x="0" y="6" rx="1" ry="1" width="20" height="4" />
                    <rect x="24" y="6" rx="1" ry="1" width="20" height="4" />
                </ContentLoader>
            )}

            <hr style={{ background: 'rgb(255 255 255 / 25%)' }} />

            <div className="d-flex justify-content-center">
                <Button size="sm" color="primary" onClick={() => handleAnnotation()}>
                    Annotate
                </Button>
            </div>
        </Container>
    );
};

export default AnnotationTooltipNew;
