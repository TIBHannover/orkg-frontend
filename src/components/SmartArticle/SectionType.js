import { updateSectionType } from 'actions/smartArticle';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { SectionTypeContainerStyled, SectionTypeStyled } from 'components/SmartArticle/styled';
import { upperFirst } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Select, { components } from 'react-select';
import { sortBy } from 'lodash';

const Option = ({ children, ...props }) => {
    return <components.Option {...props}>{children}</components.Option>;
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const SectionType = props => {
    const [editMode, setEditMode] = useState(false);
    const [options, setOptions] = useState([]);
    const [typeValue, setTypeValue] = useState({
        label: null,
        value: null
    });
    const { classes } = useOntology();
    const { type } = props;
    const dispatch = useDispatch();

    useEffect(() => {
        if (options.length === 0) {
            const ontologyClasses = classes.map(_class => ({
                label: upperFirst(_class.label),
                value: _class.iri
                //comment: _class.comment
            }));
            const additionalClasses = [
                {
                    label: 'Section',
                    value: 'Section'
                }
            ];
            const _options = sortBy([...ontologyClasses, ...additionalClasses], 'label');
            setOptions(_options);
        }
    }, [classes, options]);

    useEffect(() => {
        if (type && options.length) {
            const selected = options.find(option => option.value === type);
            setTypeValue(selected);
        }
    }, [type, options]);

    const handleBlur = () => {
        setEditMode(false);
    };

    const handleChange = selected => {
        setTypeValue(selected);

        dispatch(
            updateSectionType({
                sectionId: props.sectionId,
                type: selected.value
            })
        );
    };

    return !editMode ? (
        <SectionTypeStyled onClick={() => setEditMode(true)}>{typeValue.label}</SectionTypeStyled>
    ) : (
        <SectionTypeContainerStyled>
            <Select
                value={typeValue}
                onChange={handleChange}
                options={options}
                components={{ Option }}
                onBlur={handleBlur}
                blurInputOnSelect
                autoFocus
                openMenuOnFocus
            />
        </SectionTypeContainerStyled>
    );
};

SectionType.propTypes = {
    sectionId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
};

export default SectionType;
