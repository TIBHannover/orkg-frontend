import Tippy from '@tippyjs/react';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { OptionType } from 'components/Autocomplete/types';
import { ENTITIES } from 'constants/graphSettings';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPredicate } from 'services/backend/predicates';
import { removeAnnotation, updateAnnotationPredicate } from 'slices/viewPaperSlice';
import { followCursor } from 'tippy.js';
import type { Instance } from 'tippy.js';
import { SingleValue } from 'react-select';
import { Range } from 'slices/types';

type AnnotationTooltipProps = {
    range: Range;
    lettersNode: ReactElement[];
    getPredicateColor: (id: string) => string;
    predicateOptions: OptionType[];
};

const AnnotationTooltip: FC<AnnotationTooltipProps> = ({ range, lettersNode, getPredicateColor, predicateOptions }) => {
    const tippyInstance = useRef<Instance | null>(null);
    const dispatch = useDispatch();
    const [defaultOptions, setDefaultOptions] = useState<OptionType[]>([]);

    useEffect(() => {
        setDefaultOptions(predicateOptions);
    }, [predicateOptions]);

    const handleChangeAnnotationClass = async (selectedOption: SingleValue<OptionType>, { action }: { action: string }) => {
        if (action === 'select-option' && selectedOption) {
            dispatch(updateAnnotationPredicate({ range, selectedOption }));
        } else if (action === 'create-option' && selectedOption) {
            const predicate = await createPredicate(selectedOption.label);
            dispatch(updateAnnotationPredicate({ range, selectedOption: predicate }));
            setDefaultOptions([...defaultOptions, predicate]);
        } else if (action === 'clear') {
            dispatch(removeAnnotation(range));
        }
    };
    return (
        <span>
            <Tippy
                placement="top"
                followCursor
                plugins={[followCursor]}
                arrow
                interactive
                onCreate={(instance) => {
                    tippyInstance.current = instance;
                }}
                content={
                    <div style={{ width: '300px' }}>
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            additionalOptions={defaultOptions}
                            placeholder="Select or type to enter a property"
                            onChange={(e, a) => {
                                handleChangeAnnotationClass(e, a);
                                tippyInstance.current?.hide();
                            }}
                            value={{
                                label: range.predicate.label ? range.predicate.label : '',
                                id: range.predicate.id,
                            }}
                            key={range.id}
                            isClearable
                            openMenuOnFocus
                            allowCreate
                        />
                    </div>
                }
            >
                <span style={{ backgroundColor: getPredicateColor(range.predicate.id), color: 'black' }} id={`CR${range.id}`}>
                    {lettersNode}
                </span>
            </Tippy>
        </span>
    );
};

export default AnnotationTooltip;
