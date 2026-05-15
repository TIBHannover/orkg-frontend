import { Popover } from '@heroui/react';
import { FC, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { ENTITIES } from '@/constants/graphSettings';
import { createPredicate, getPredicate } from '@/services/backend/predicates';
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
            const predicateId: string = await createPredicate(selectedOption.label);
            const predicate = await getPredicate(predicateId);
            dispatch(updateAnnotationPredicate({ range, selectedOption: predicate }));
            setDefaultOptions([...defaultOptions, predicate]);
        } else if (action === 'clear') {
            dispatch(removeAnnotation(range));
        }
    };

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger
                id={`CR${range.id}`}
                className="inline-block align-baseline cursor-pointer rounded-sm"
                style={{ backgroundColor: getPredicateColor(range.predicate.id), color: 'black' }}
            >
                {lettersNode}
            </Popover.Trigger>
            <Popover.Content placement="top" className="w-[300px]">
                <Popover.Dialog className="p-3">
                    <Popover.Arrow />
                    <Autocomplete
                        entityType={ENTITIES.PREDICATE}
                        additionalOptions={defaultOptions}
                        placeholder="Select or type to enter a property"
                        onChange={(e, a) => {
                            handleChangeAnnotationClass(e, a);
                            setIsOpen(false);
                        }}
                        value={range.predicate?.id ? { label: range.predicate.label ?? '', id: range.predicate.id } : null}
                        key={range.id}
                        isClearable
                        openMenuOnFocus
                        allowCreate
                    />
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default AnnotationTooltip;
