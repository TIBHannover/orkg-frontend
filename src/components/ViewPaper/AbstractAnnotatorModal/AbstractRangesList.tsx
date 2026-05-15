import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Chip } from '@heroui/react';
import capitalize from 'capitalize';
import toArray from 'lodash/toArray';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SingleValue } from 'react-select';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { ENTITIES } from '@/constants/graphSettings';
import { Range, RootStore } from '@/slices/types';
import { removeAnnotation, toggleEditAnnotation, updateAnnotationPredicate } from '@/slices/viewPaperSlice';

type AbstractRangesListProps = {
    predicateOptions: Array<{
        id: string;
        label: string;
        description: string;
    }>;
    getPredicateColor: (id: string) => string;
};

const AbstractRangesList: FC<AbstractRangesListProps> = ({ predicateOptions, getPredicateColor }) => {
    const ranges = useSelector((state: RootStore) => state.viewPaper.ranges);
    const dispatch = useDispatch();
    const handleChangeAnnotationClass = (selectedOption: SingleValue<OptionType>, { action }: { action: string }, range: Range) => {
        if (action === 'select-option' || action === 'create-option') {
            dispatch(updateAnnotationPredicate({ range, selectedOption }));
        }
    };

    const rangeArray = toArray(ranges);

    return (
        <div className="rounded-md border border-border overflow-hidden">
            {rangeArray.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border">
                    {rangeArray.map((range: Range) => (
                        <li key={`r${range.id}`} className="px-3 py-2 bg-surface">
                            {!range.isEditing && (
                                <div className="py-1 flex flex-row items-center">
                                    {capitalize(range.text)}{' '}
                                    <Chip className="ml-2 rounded-full" style={{ color: '#333', background: getPredicateColor(range.predicate.id) }}>
                                        {range.predicate.label}
                                    </Chip>
                                    <div className="ml-2 flex items-center gap-1">
                                        <ActionButton action={() => dispatch(toggleEditAnnotation(range.id))} icon={faPen} title="Edit label" />
                                        <ActionButton action={() => dispatch(removeAnnotation(range))} icon={faTrash} title="Delete Annotation" />
                                    </div>
                                </div>
                            )}
                            {range.isEditing && (
                                <Autocomplete
                                    size="sm"
                                    className="pt-1"
                                    entityType={ENTITIES.PREDICATE}
                                    additionalOptions={predicateOptions}
                                    placeholder="Select or type to enter a property"
                                    onChange={(e, a) => {
                                        handleChangeAnnotationClass(e, a, range);
                                        dispatch(toggleEditAnnotation(range.id));
                                    }}
                                    value={range.predicate?.id ? { label: range.predicate.label ?? '', id: range.predicate.id } : null}
                                    onBlur={() => dispatch(toggleEditAnnotation(range.id))}
                                    allowCreate
                                    autoFocus
                                />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="py-6 text-center bg-surface-secondary text-muted">No annotations</div>
            )}
        </div>
    );
};

export default AbstractRangesList;
