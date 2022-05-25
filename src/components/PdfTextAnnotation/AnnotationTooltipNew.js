import { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import useSuggestions from 'components/PdfTextAnnotation/hooks/useSuggestions';
import { upperFirst, isString } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { Button } from 'reactstrap';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import ContentLoader from 'react-content-loader';

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

const Option = ({ children, ...props }) => (
    <components.Option {...props}>
        <StyledSelectOption>
            <span>{children}</span>
            <Tippy content={props.data.comment}>
                <span>
                    <Icon icon={faQuestionCircle} />
                </span>
            </Tippy>
        </StyledSelectOption>
    </components.Option>
);

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired,
};

const AnnotationTooltipNew = props => {
    const { classes, recommendedClasses } = useOntology();
    const { getSuggestedClasses, suggestedClasses, isLoading: suggestionsIsLoading } = useSuggestions();
    const { content, position, hideTipAndSelection, handleAnnotate } = props;
    const [type, setType] = useState(null);
    const [hasFocus, setHasFocus] = useState(false);
    const { transformSelection } = props;

    const options = [
        {
            label: 'Recommended properties',
            options: recommendedClasses.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri,
                comment: _class.comment,
            })),
        },
        {
            label: 'All properties',
            options: classes.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri,
                comment: _class.comment,
            })),
        },
    ];

    const handleAnnotation = (value = null) => {
        if (!type && !value) {
            toast.error('Please enter an annotation type');
            return;
        }
        const valueType = value ?? type.value;

        handleAnnotate({
            content: {
                ...content,
                text: isString(content.text) ? content.text.replace(/\s+/g, ' ').trim() : content.text, // replace double white spaces that could occur when copying text from PDFs
            },
            position,
            type: valueType,
        });
        hideTipAndSelection();
    };

    const handleSuggestionClick = value => {
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

    useEffect(() => {
        getSuggestedClasses(content.text);
    }, [content.text, getSuggestedClasses]);

    return (
        <Container onClick={focusContainer}>
            <div className="mb-1">Select type</div>

            <div style={{ color: '#000' }}>
                <Select value={type} onChange={selected => setType(selected)} options={options} components={{ Option }} />
            </div>

            <div className="mt-2 mb-1">Smart suggestions</div>

            {!suggestionsIsLoading ? (
                <div style={{ minHeight: 62 }}>
                    {suggestedClasses.length > 0 ? (
                        suggestedClasses.map(suggestion => (
                            <Button
                                active={type && type.value === suggestion.iri}
                                className="rounded-pill me-2 mb-1"
                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                size="sm"
                                color="secondary"
                                key={suggestion.iri}
                                onClick={() => handleSuggestionClick(suggestion.iri, suggestion.label)}
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

AnnotationTooltipNew.propTypes = {
    content: PropTypes.object.isRequired,
    position: PropTypes.object.isRequired,
    hideTipAndSelection: PropTypes.func.isRequired,
    handleAnnotate: PropTypes.func.isRequired,
    transformSelection: PropTypes.func.isRequired,
};

export default AnnotationTooltipNew;
