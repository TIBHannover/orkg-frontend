import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { updateAnnotationClass, removeAnnotation, toggleEditAnnotation } from 'slices/viewPaperSlice';
import Tippy from '@tippyjs/react';
import { useSelector, useDispatch } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';
import capitalize from 'capitalize';
import styled from 'styled-components';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import toArray from 'lodash/toArray';

const ListGroupItemStyle = styled(ListGroupItem)`
    .rangeOption {
        visibility: hidden;
        cursor: pointer;
    }

    &:hover .rangeOption {
        visibility: visible;
        display: inline-block !important;
    }
`;

const RangeItemOption = styled.div`
    display: inline-block !important;

    & > .rangeOption {
        font-size: 90%;

        &:hover {
            text-decoration: underline;
        }
    }
`;

/* propertyItem */
const StyledStatementItem = styled(ListGroupItem)`
    padding: 0.5rem 0.75rem !important;
    cursor: default;
    background-color: ${props => props.theme.lightLighter} !important;
    border-color: ${props => props.theme.lightDarker} !important;
    overflow-wrap: anywhere;
    flex: 1;

    &.selectable {
        cursor: pointer;
    }

    & > .statementItemIcon {
        font-size: 18px;
        margin-top: 3px;
        color: ${props => props.theme.primary};

        &.open {
            color: #fff;
        }
    }

    & > .deletePredicate {
        font-size: 90%;
        display: none;

        &:hover {
            text-decoration: underline;
        }
    }

    &.statementActive {
        background-color: ${props => props.theme.secondary} !important;
        border-color: ${props => props.theme.secondary} !important;
        color: #fff;

        & .deletePredicate {
            display: inline-block !important;
        }
    }
`;

function AbstractRangesList(props) {
    const ranges = useSelector(state => state.viewPaper.ranges);

    const dispatch = useDispatch();
    const [defaultOptions, setDefaultOptions] = useState([]);

    useEffect(() => {
        setDefaultOptions(props.classOptions);
    }, [props.classOptions]);

    const handleChangeAnnotationClass = (selectedOption, { action }, range) => {
        if (action === 'select-option') {
            dispatch(updateAnnotationClass({ range, selectedOption }));
        } else if (action === 'create-option') {
            const newOption = {
                label: selectedOption.label,
                id: selectedOption.label,
            };
            dispatch(updateAnnotationClass({ range, selectedOption: newOption }));
        } else if (action === 'clear') {
            dispatch(removeAnnotation(range));
        }
    };
    const rangeArray = toArray(ranges).filter(r => r.certainty >= props.certaintyThreshold);

    return (
        <div>
            <ListGroup>
                {rangeArray.length > 0 ? (
                    rangeArray.map(range => (
                        <ListGroupItemStyle key={`r${range.id}`} onClick={() => null}>
                            <div className="flex-grow-1">
                                {!range.isEditing ? (
                                    <>
                                        {capitalize(range.text)}{' '}
                                        <Badge color={null} pill style={{ color: '#333', background: props.getClassColor(range.class.label) }}>
                                            {range.class.label}
                                        </Badge>
                                        <RangeItemOption className="float-end">
                                            <Button
                                                color="link"
                                                size="sm"
                                                className="rangeOption p-0 me-3"
                                                onClick={() => dispatch(toggleEditAnnotation(range.id))}
                                            >
                                                <Tippy content="Edit label">
                                                    <span>
                                                        <Icon icon={faPen} /> Edit
                                                    </span>
                                                </Tippy>
                                            </Button>
                                            <Button
                                                color="link"
                                                size="sm"
                                                className="rangeOption p-0 me-2"
                                                onClick={() => dispatch(removeAnnotation(range))}
                                            >
                                                <Tippy content="Delete Annotation">
                                                    <span>
                                                        <Icon icon={faTrash} /> Delete
                                                    </span>
                                                </Tippy>
                                            </Button>
                                        </RangeItemOption>
                                    </>
                                ) : (
                                    <AutoComplete
                                        entityType={ENTITIES.PREDICATE}
                                        defaultOptions={defaultOptions}
                                        placeholder="Select or type to enter a property"
                                        onChange={(e, a) => {
                                            handleChangeAnnotationClass(e, a, range);
                                            dispatch(toggleEditAnnotation(range.id));
                                        }}
                                        value={{
                                            label: range.class.label ? range.class.label : '',
                                            id: range.class.id,
                                            certainty: range.certainty,
                                            range_id: range.id,
                                            isEditing: range.isEditing,
                                        }}
                                        onBlur={() => {
                                            dispatch(toggleEditAnnotation(range.id));
                                        }}
                                        key={value => value}
                                        isClearable
                                        openMenuOnFocus={true}
                                        autoLoadOption={true}
                                        allowCreate={true}
                                        autoFocus={true}
                                    />
                                )}
                            </div>
                        </ListGroupItemStyle>
                    ))
                ) : (
                    <StyledStatementItem>No annotations</StyledStatementItem>
                )}
            </ListGroup>
        </div>
    );
}

export default AbstractRangesList;

AbstractRangesList.propTypes = {
    classOptions: PropTypes.array.isRequired,
    certaintyThreshold: PropTypes.array.isRequired,
    getClassColor: PropTypes.func.isRequired,
};
