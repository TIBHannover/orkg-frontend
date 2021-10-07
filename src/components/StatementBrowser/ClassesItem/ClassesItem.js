import { useState, Fragment, useRef, useEffect } from 'react';
import { Button, InputGroup, InputGroupAddon } from 'reactstrap';
import { faPen, faTags } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Link } from 'react-router-dom';
import { getClassById } from 'services/backend/classes';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { updateResourceClasses, removeEmptyPropertiesOfClass } from 'actions/statementBrowser';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Confirm from 'components/ConfirmationModal/ConfirmationModal';
import { ENTITIES } from 'constants/graphSettings';
import { toast } from 'react-toastify';

export const ClassesStyle = styled.div`
    background-color: ${props => props.theme.lightLighter};
    overflow-wrap: break-word;
    margin-top: -2px;
    margin-right: -2px;
    margin-bottom: -2px;
    border-radius: 4px;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.125) !important;
`;

const ClassesItem = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const [editMode, setEditMode] = useState(false);
    const classesAutocompleteRef = useRef(null);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const findClasses = async () => {
            setIsLoading(true);
            const classesCalls = resource.classes?.map(c => getClassById(c)) ?? [];
            Promise.all(classesCalls)
                .then(classes => {
                    setIsLoading(false);
                    setClasses(classes ?? []);
                })
                .catch(err => {
                    setClasses([]);
                    setIsLoading(false);
                    console.error(err);
                });
        };
        findClasses();
    }, [resource.classes]);

    const handleChangeClasses = async (selected, action) => {
        if (action.action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
            } else {
                return null;
            }
        }
        if (action.action === 'remove-value') {
            // Remove the properties related to the template if they have no values
            dispatch(removeEmptyPropertiesOfClass({ resourceId: selectedResource, classId: action.removedValue?.id }));
        }
        const newClasses = !selected ? [] : selected;
        setClasses(newClasses);
        dispatch(updateResourceClasses({ resourceId: selectedResource, classes: newClasses?.map(c => c.id) ?? [], syncBackend: props.syncBackend }));
        toast.dismiss();
        props.syncBackend && toast.success('Resource classes updated successfully');
    };

    return (
        <div>
            {selectedResource && resource._class === ENTITIES.RESOURCE && (
                <ClassesStyle className="text-muted mb-3 d-flex align-items-center clearfix">
                    <Icon icon={faTags} className="mr-1" /> Instance of:{' '}
                    {!editMode && !isLoading && (
                        <div className="mx-1" style={{ padding: '3.5px 0' }}>
                            {classes?.map((c, index) => (
                                <Fragment key={c.id}>
                                    <Link target="_blank" to={reverse(ROUTES.CLASS, { id: c.id })}>
                                        {c.label}
                                    </Link>
                                    {index + 1 !== classes.length && ', '}
                                </Fragment>
                            ))}
                            {classes?.length === 0 && <i>No classes</i>}
                        </div>
                    )}
                    {!editMode && isLoading && (
                        <div style={{ padding: '3.5px 0' }}>
                            <i>Loading ...</i>
                        </div>
                    )}
                    {props.enableEdit && editMode && (
                        <div className="flex-grow-1 ml-1 ">
                            <InputGroup size="sm">
                                <AutoComplete
                                    entityType={ENTITIES.CLASS}
                                    onChange={(selected, action) => {
                                        // blur the field allows to focus and open the menu again
                                        classesAutocompleteRef.current && classesAutocompleteRef.current.blur();
                                        handleChangeClasses(selected, action);
                                    }}
                                    placeholder="Specify the classes of the resource"
                                    value={classes}
                                    autoLoadOption={true}
                                    openMenuOnFocus={true}
                                    allowCreate={true}
                                    innerRef={classesAutocompleteRef}
                                    isMulti
                                    autoFocus={false}
                                    ols={true}
                                    cssClasses="form-control-sm"
                                    inputId="classes-autocomplete"
                                />

                                <InputGroupAddon addonType="append">
                                    <Button onClick={() => setEditMode(false)}>Done</Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    )}
                    {props.enableEdit && !editMode && <StatementActionButton title="Edit classes" icon={faPen} action={() => setEditMode(true)} />}
                </ClassesStyle>
            )}
        </div>
    );
};

ClassesItem.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired
};

ClassesItem.defaultProps = {
    enableEdit: false,
    syncBackend: false
};

export default ClassesItem;
