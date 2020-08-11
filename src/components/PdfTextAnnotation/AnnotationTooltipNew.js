import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import useSuggestions from 'components/PdfTextAnnotation/hooks/useSuggestions';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import { Button } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { components } from 'react-select';

const Container = styled.div`
    background: #333333;
    padding: 10px;
    border-radius: 6px;
    color: #fff;
    width: 430px;
`;

const StyledSelectOption = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Option = ({ children, ...props }) => {
    return (
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
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const AnnotationTooltipNew = props => {
    const { classes, recommendedClasses } = useOntology();
    const { getSuggestedClasses } = useSuggestions();
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
                comment: _class.comment
            }))
        },
        {
            label: 'All properties',
            options: classes.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri,
                comment: _class.comment
            }))
        }
    ];

    const handleAnnotation = (value = null) => {
        if (!type && !value) {
            toast.error('Please enter an annotation type');
            return;
        }
        const valueType = value ?? type.value;
        handleAnnotate({ content, position, type: valueType });
        hideTipAndSelection();
    };

    const handleSuggestionClick = (value, label) => {
        ///setType({ value, label: upperFirst(label) }, () => {
        handleAnnotation(value);
        //});
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

    const suggestions = getSuggestedClasses(content.text);

    return (
        <Container onClick={focusContainer}>
            <div className="mb-1">Select type</div>

            <div style={{ color: '#000' }}>
                <Select value={type} onChange={selected => setType(selected)} options={options} components={{ Option }} />
            </div>

            {suggestions.length > 0 && (
                <>
                    <div className="mt-2 mb-1">Smart suggestions</div>

                    <div>
                        {suggestions.map(suggestion => (
                            <Button
                                active={type && type.value === suggestion.iri}
                                className="rounded-pill mr-2"
                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                size="sm"
                                color="darkblue"
                                key={suggestion.iri}
                                onClick={() => handleSuggestionClick(suggestion.iri, suggestion.label)}
                            >
                                {upperFirst(suggestion.label)}
                            </Button>
                        ))}
                    </div>
                </>
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
    transformSelection: PropTypes.func.isRequired
};

export default AnnotationTooltipNew;
