import Tippy from '@tippyjs/react';
import { updateSectionType } from 'actions/smartReview';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { SectionTypeContainerStyled, SectionTypeStyled } from 'components/SmartReview/styled';
import { CLASSES } from 'constants/graphSettings';
import { sortBy, upperFirst } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Select, { components } from 'react-select';

const Option = ({ children, ...props }) => {
    return <components.Option {...props}>{children}</components.Option>;
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const SectionType = props => {
    const { type, isDisabled, disabledTooltip } = props;
    const [editMode, setEditMode] = useState(false);
    const [options, setOptions] = useState([]);
    const [typeValue, setTypeValue] = useState({
        label: null,
        value: null
    });
    const { classes } = useOntology();
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
                },
                {
                    label: 'Resource',
                    value: CLASSES.RESOURCE_SECTION,
                    disabled: true
                },
                {
                    label: 'Property',
                    value: CLASSES.PROPERTY_SECTION,
                    disabled: true
                },
                {
                    label: 'Comparison',
                    value: CLASSES.COMPARISON_SECTION,
                    disabled: true
                },
                {
                    label: 'Visualization',
                    value: CLASSES.VISUALIZATION_SECTION,
                    disabled: true
                },
                {
                    label: 'Data table',
                    value: CLASSES.DATA_TABLE_SECTION,
                    disabled: true
                }
            ];
            const _options = sortBy([...ontologyClasses, ...additionalClasses], 'label');
            setOptions(_options);
        }
    }, [classes, options]);

    useEffect(() => {
        if (type && options.length) {
            const selected = options.find(option => option.value === type);
            if (!selected) {
                return;
            }
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

    return (
        <>
            {isDisabled && (
                <SectionTypeStyled disabled>
                    <Tippy hideOnClick={false} content={disabledTooltip}>
                        <span>{typeValue.label}</span>
                    </Tippy>
                </SectionTypeStyled>
            )}

            {!isDisabled && !editMode && (
                <SectionTypeStyled className="focus-primary" onClick={() => setEditMode(true)}>
                    {typeValue.label}
                </SectionTypeStyled>
            )}
            {editMode && (
                <SectionTypeContainerStyled>
                    <Select
                        value={typeValue}
                        onChange={handleChange}
                        options={options}
                        components={{ Option }}
                        onBlur={handleBlur}
                        isOptionDisabled={option => option.disabled}
                        classNamePrefix="react-select"
                        blurInputOnSelect
                        autoFocus
                        openMenuOnFocus
                    />
                </SectionTypeContainerStyled>
            )}
        </>
    );
};

SectionType.propTypes = {
    sectionId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    disabledTooltip: PropTypes.string
};

SectionType.defaultProps = {
    isDisabled: false,
    disabledTooltip: 'The type of this section cannot be changed'
};

export default SectionType;
