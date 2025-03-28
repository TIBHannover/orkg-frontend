import { FC, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import Popover from '@/components/FloatingUI/Popover';
import { ENTITIES } from '@/constants/graphSettings';
import { createPredicate } from '@/services/backend/predicates';
import { Range } from '@/slices/types';
import { removeAnnotation, updateAnnotationPredicate } from '@/slices/viewPaperSlice';

type AnnotationTooltipProps = {
    range: Range;
    lettersNode: ReactElement[];
    getPredicateColor: (id: string) => string;
    predicateOptions: OptionType[];
};

const AnnotationTooltip: FC<AnnotationTooltipProps> = ({ range, lettersNode, getPredicateColor, predicateOptions }) => {
    const dispatch = useDispatch();
    const [defaultOptions, setDefaultOptions] = useState<OptionType[]>([]);
    const [isOpen, setIsOpen] = useState(false);

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
            <Popover
                open={isOpen}
                onOpenChange={setIsOpen}
                placement="top"
                content={
                    <div style={{ width: '300px' }}>
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            additionalOptions={defaultOptions}
                            placeholder="Select or type to enter a property"
                            onChange={(e, a) => {
                                handleChangeAnnotationClass(e, a);
                                setIsOpen(false);
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
                <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setIsOpen(!isOpen);
                        }
                    }}
                    style={{ backgroundColor: getPredicateColor(range.predicate.id), color: 'black' }}
                    id={`CR${range.id}`}
                >
                    {lettersNode}
                </span>
            </Popover>
        </span>
    );
};

export default AnnotationTooltip;
