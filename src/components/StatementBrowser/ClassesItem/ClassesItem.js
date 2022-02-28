import { useState, Fragment, useRef, useEffect } from 'react';
import { Button, InputGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTags, faSpinner } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Link } from 'react-router-dom';
import { getClassById } from 'services/backend/classes';
import { reverse } from 'named-urls';
import { CSSTransition } from 'react-transition-group';
import ROUTES from 'constants/routes.js';
import { updateResourceClasses, removeEmptyPropertiesOfClass } from 'actions/statementBrowser';
import AutoComplete from 'components/Autocomplete/Autocomplete';
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

const AnimationContainer = styled(CSSTransition)`
    &.zoom-enter {
        opacity: 0;
        transform: scale(0.9);
    }
    &.zoom-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 300ms, transform 300ms;
    }
    &.zoom-exit {
        opacity: 1;
    }
    &.zoom-exit-active {
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 300ms, transform 300ms;
    }
`;

const ClassesItem = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const [editMode, setEditMode] = useState(false);
    const classesAutocompleteRef = useRef(null);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useDispatch();
    const preferences = useSelector(state => state.statementBrowser.preferences);

    useEffect(() => {
        let isMounted = true;
        const findClasses = async () => {
            setIsLoading(true);
            const classesCalls = resource.classes?.map(c => getClassById(c)) ?? [];
            await Promise.all(classesCalls)
                .then(res_classes => {
                    if (isMounted) {
                        setIsLoading(false);
                        setClasses(res_classes ?? []);
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        setClasses([]);
                        setIsLoading(false);
                        console.error(err);
                    }
                });
        };
        if (preferences['showClasses'] && resource?._class === ENTITIES.RESOURCE) {
            findClasses();
        }
        return () => {
            isMounted = false;
        };
    }, [preferences, resource?._class, resource.classes]);

    const handleChangeClasses = async (selected, action) => {
        setIsSaving(true);
        if (action.action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
            } else {
                setIsSaving(false);
                return null;
            }
        }
        if (action.action === 'remove-value') {
            // Remove the properties related to the template if they have no values
            dispatch(removeEmptyPropertiesOfClass({ resourceId: selectedResource, classId: action.removedValue?.id }));
        }
        const newClasses = !selected ? [] : selected;
        dispatch(updateResourceClasses({ resourceId: selectedResource, classes: newClasses?.map(c => c.id) ?? [], syncBackend: props.syncBackend }))
            .then(() => {
                setClasses(newClasses);
                setIsSaving(false);
                toast.dismiss();
                props.syncBackend && toast.success('Resource classes updated successfully');
            })
            .catch(() => {
                setIsSaving(false);
                toast.dismiss();
                toast.error('Something went wrong while updating the classes.');
            });
    };

    return (
        <AnimationContainer in={preferences['showClasses']} timeout={300} classNames="zoom" unmountOnExit>
            <div>
                {selectedResource && resource._class === ENTITIES.RESOURCE && (
                    <ClassesStyle className="text-muted mb-2 d-flex align-items-center clearfix">
                        <Icon icon={faTags} className="me-1" />
                        <span className="text-secondary-darker"> Instance of: </span>
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
                                {classes?.length === 0 && <i className="text-secondary-darker">No classes</i>}
                            </div>
                        )}
                        {!editMode && isLoading && (
                            <div style={{ padding: '3.5px 0' }}>
                                <i>Loading ...</i>
                            </div>
                        )}
                        {props.enableEdit && editMode && (
                            <div className="flex-grow-1 ms-1 ">
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
                                        isDisabled={isSaving}
                                        cssClasses="form-control-sm"
                                        inputId="classes-autocomplete"
                                    />

                                    <Button onClick={() => setEditMode(false)} disabled={isSaving}>
                                        {!isSaving ? 'Done' : <Icon icon={faSpinner} spin={true} />}
                                    </Button>
                                </InputGroup>
                            </div>
                        )}
                        {props.enableEdit && !editMode && (
                            <StatementActionButton title="Edit classes" icon={faPen} action={() => setEditMode(true)} />
                        )}
                    </ClassesStyle>
                )}
            </div>
        </AnimationContainer>
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
