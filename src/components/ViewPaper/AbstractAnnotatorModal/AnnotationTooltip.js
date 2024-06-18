import { useRef, useState, useEffect } from 'react';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import { useDispatch } from 'react-redux';
import { updateAnnotationClass, removeAnnotation } from 'slices/viewPaperSlice';
import { createPredicate } from 'services/backend/predicates';

function AnnotationTooltip(props) {
    const tippyInstance = useRef(null);
    const dispatch = useDispatch();
    const [defaultOptions, setDefaultOptions] = useState([]);

    useEffect(() => {
        setDefaultOptions(props.classOptions);
    }, [props.classOptions]);

    const handleChangeAnnotationClass = async (selectedOption, { action }, range) => {
        if (action === 'select-option') {
            dispatch(updateAnnotationClass({ range, selectedOption }));
        } else if (action === 'create-option') {
            const predicate = await createPredicate(selectedOption.label);
            dispatch(updateAnnotationClass({ range, selectedOption: predicate }));
            setDefaultOptions([...defaultOptions, predicate]);
        } else if (action === 'clear') {
            dispatch(removeAnnotation(range));
        }
    };

    return (
        <span>
            <Tippy
                placement="top"
                appendTo={document.body}
                followCursor
                plugins={[followCursor]}
                arrow
                interactive
                onCreate={(instance) => (tippyInstance.current = instance)}
                content={
                    <div style={{ width: '300px' }}>
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            additionalOptions={defaultOptions}
                            placeholder="Select or type to enter a property"
                            onChange={(e, a) => {
                                handleChangeAnnotationClass(e, a, props.range);
                                tippyInstance.current.hide();
                            }}
                            value={{
                                label: props.range.class.label ? props.range.class.label : '',
                                id: props.range.class.id,
                                certainty: props.range.certainty,
                                range_id: props.range.id,
                            }}
                            key={(value) => value}
                            isClearable
                            openMenuOnFocus
                            allowCreate
                        />
                    </div>
                }
            >
                <span style={{ backgroundColor: props.getClassColor(props.range.class.label), color: 'black' }} id={`CR${props.range.id}`}>
                    {props.lettersNode}
                </span>
            </Tippy>
        </span>
    );
}

export default AnnotationTooltip;

AnnotationTooltip.propTypes = {
    range: PropTypes.object,
    lettersNode: PropTypes.array,
    getClassColor: PropTypes.func.isRequired,
    classOptions: PropTypes.array.isRequired,
};
