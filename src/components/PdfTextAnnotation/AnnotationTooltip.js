import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import { Button } from 'reactstrap';
import Select from 'react-select';
import { useDispatch } from 'react-redux';
import { createAnnotation } from 'actions/pdfTextAnnotation';
import { toast } from 'react-toastify';

const Container = styled.div`
    background: #333333;
    padding: 10px;
    border-radius 6px;
    color: #fff;
    width: 430px;
`;

const AnnotationTooltip = props => {
    const { classes, recommendedClasses } = useOntology();
    //const dispatch = useDispatch();
    const { content, position, hideTipAndSelection, handleAnnotate } = props;
    const [type, setType] = useState(null);

    const handleAnnotation = () => {
        if (!type) {
            toast.error('Please enter an annotation type');
            return;
        }
        handleAnnotate({ content, position, type: type.value });
        hideTipAndSelection();
    };

    const options = [
        {
            label: 'Recommended properties',
            options: recommendedClasses.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri
            }))
        },
        {
            label: 'All properties',
            options: classes.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri
            }))
        }
    ];

    return (
        <Container onClick={e => e.stopPropagation()}>
            <div className="mb-1">Select type</div>

            <div style={{ color: '#000' }}>
                <Select
                    //isClearable
                    value={type}
                    onChange={selected => setType(selected)}
                    options={options}
                    //getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                    //getOptionValue={({ id }) => id}
                />
            </div>

            <div className="mt-2 mb-1">Smart suggestions</div>

            <div>
                <Button
                    active={type && type.value === 'FutureWork'}
                    className="rounded-pill mr-2"
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                    size="sm"
                    color="darkblue"
                    onClick={() => setType({ value: 'FutureWork', label: 'Future work' })}
                >
                    Future work
                </Button>
                <Button
                    active={type && type.value === 'Conclusion'}
                    className="rounded-pill mr-2"
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                    size="sm"
                    color="darkblue"
                    onClick={() => setType({ value: 'Conclusion', label: 'Conclusion' })}
                >
                    Conclusion
                </Button>
                <Button
                    active={type && type.value === 'Data'}
                    className="rounded-pill mr-2"
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                    size="sm"
                    color="darkblue"
                    onClick={() => setType({ value: 'Data', label: 'Data' })}
                >
                    Data
                </Button>
            </div>

            <hr style={{ background: 'rgb(255 255 255 / 25%)' }} />

            <div className="d-flex justify-content-center">
                <Button size="sm" color="primary" onClick={handleAnnotation}>
                    Annotate
                </Button>
            </div>
        </Container>
    );
};

AnnotationTooltip.propTypes = {
    content: PropTypes.object.isRequired,
    position: PropTypes.object.isRequired,
    hideTipAndSelection: PropTypes.func.isRequired,
    handleAnnotate: PropTypes.func.isRequired
};

export default AnnotationTooltip;
