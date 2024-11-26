import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import capitalize from 'capitalize';
import ActionButton from 'components/ActionButton/ActionButton';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { OptionType } from 'components/Autocomplete/types';
import { ENTITIES } from 'constants/graphSettings';
import toArray from 'lodash/toArray';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SingleValue } from 'react-select';
import { Badge, ListGroup, ListGroupItem } from 'reactstrap';
import { Range, RootStore } from 'slices/types';
import { removeAnnotation, toggleEditAnnotation, updateAnnotationPredicate } from 'slices/viewPaperSlice';
import { useTheme } from 'styled-components';

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
    const theme = useTheme();
    const dispatch = useDispatch();
    const handleChangeAnnotationClass = (selectedOption: SingleValue<OptionType>, { action }: { action: string }, range: Range) => {
        if (action === 'select-option') {
            dispatch(updateAnnotationPredicate({ range, selectedOption }));
        } else if (action === 'create-option') {
            dispatch(updateAnnotationPredicate({ range, selectedOption }));
        }
    };

    const rangeArray = toArray(ranges);

    return (
        <div>
            <ListGroup>
                {rangeArray.length > 0 &&
                    rangeArray.map((range: Range) => (
                        <ListGroupItem key={`r${range.id}`}>
                            <div className="flex-grow-1">
                                {!range.isEditing && (
                                    <div className="py-1 d-flex flex-row align-items-center">
                                        {capitalize(range.text)}{' '}
                                        <Badge
                                            color=""
                                            className="ms-2"
                                            pill
                                            style={{ color: '#333', background: getPredicateColor(range.predicate.id) }}
                                        >
                                            {range.predicate.label}
                                        </Badge>
                                        <div className="ms-2">
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
                                        value={{
                                            label: range.predicate.label ? range.predicate.label : '',
                                            id: range.predicate.id,
                                        }}
                                        onBlur={() => {
                                            dispatch(toggleEditAnnotation(range.id));
                                        }}
                                        allowCreate
                                        autoFocus
                                    />
                                )}
                            </div>
                        </ListGroupItem>
                    ))}
                {rangeArray.length === 0 && (
                    <ListGroupItem className="py-3" style={{ backgroundColor: theme.lightLighter }}>
                        No annotations
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>
    );
};

export default AbstractRangesList;
