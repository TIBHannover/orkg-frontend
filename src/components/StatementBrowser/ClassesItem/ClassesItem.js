import Link from 'next/link';
import { faPen, faPuzzlePiece, faSpinner, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import Confirm from 'components/ConfirmationModal/ConfirmationModal';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import useUsedTemplates from 'components/StatementBrowser/TemplatesModal/hooks/useUsedTemplates';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CSSTransition } from 'react-transition-group';
import { Button, InputGroup } from 'reactstrap';
import { getClassById } from 'services/backend/classes';
import { removeEmptyPropertiesOfClass, updateResourceClassesAction as updateResourceClasses } from 'slices/statementBrowserSlice';
import styled from 'styled-components';

export const ClassesStyle = styled.div`
    background-color: ${(props) => props.theme.lightLighter};
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

const ClassesItem = ({ enableEdit = false, syncBackend = false }) => {
    const selectedResource = useSelector((state) => state.statementBrowser.selectedResource);
    const resource = useSelector((state) => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const [editMode, setEditMode] = useState(false);
    const classesAutocompleteRef = useRef(null);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useDispatch();
    const preferences = useSelector((state) => state.statementBrowser.preferences);
    const { usedTemplates, isLoadingUsedTemplates } = useUsedTemplates({ resourceId: selectedResource });

    useEffect(() => {
        let isMounted = true;
        const findClasses = async () => {
            setIsLoading(true);
            const classesCalls = resource.classes?.map((c) => getClassById(c)) ?? [];
            await Promise.all(classesCalls)
                .then((resClasses) => {
                    if (isMounted) {
                        setIsLoading(false);
                        setClasses(resClasses ?? []);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setClasses([]);
                        setIsLoading(false);
                    }
                });
        };
        if (preferences.showClasses && resource?._class === ENTITIES.RESOURCE) {
            findClasses();
        }
        return () => {
            isMounted = false;
        };
    }, [preferences, resource?._class, resource.classes]);

    const handleChangeClasses = async (selected, action) => {
        setIsSaving(true);
        if (action.action === 'create-option') {
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                const _foundIndex = selected.findIndex((x) => x.__isNew__);
                selected[_foundIndex] = newClass;
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
        dispatch(updateResourceClasses({ resourceId: selectedResource, classes: newClasses?.map((c) => c.id) ?? [], syncBackend }))
            .then(() => {
                setClasses(newClasses);
                setIsSaving(false);
                toast.dismiss();
                if (syncBackend) {
                    toast.success('Resource classes updated successfully');
                }
            })
            .catch(() => {
                setIsSaving(false);
                toast.dismiss();
                toast.error('Something went wrong while updating the classes.');
            });
    };

    return (
        <>
            <AnimationContainer in={preferences.showClasses} timeout={300} classNames="zoom" unmountOnExit>
                <div>
                    {selectedResource && resource._class === ENTITIES.RESOURCE && (
                        <ClassesStyle className="text-muted mb-2 d-flex align-items-center clearfix">
                            <Icon icon={faTags} className="me-1" />
                            <span className="text-secondary-darker"> Instance of: </span>
                            {!editMode && !isLoading && (
                                <div className="mx-1" style={{ padding: '3.5px 0' }}>
                                    {classes?.map((c, index) => (
                                        <Fragment key={c.id}>
                                            <DescriptionTooltip id={c.id} _class={ENTITIES.CLASS} disabled={!preferences.showDescriptionTooltips}>
                                                <Link target="_blank" href={reverse(ROUTES.CLASS, { id: c.id })}>
                                                    {c.label}
                                                </Link>
                                            </DescriptionTooltip>
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
                            {enableEdit && editMode && (
                                <div className="flex-grow-1 ms-1 ">
                                    <InputGroup size="sm">
                                        <Autocomplete
                                            entityType={ENTITIES.CLASS}
                                            onChange={(selected, action) => {
                                                handleChangeClasses(selected, action);
                                            }}
                                            placeholder="Specify the classes of the resource"
                                            value={classes}
                                            openMenuOnFocus
                                            allowCreate
                                            innerRef={classesAutocompleteRef}
                                            isMulti
                                            enableExternalSources
                                            isDisabled={isSaving}
                                            size="sm"
                                            inputId="classes-autocomplete"
                                        />

                                        <Button onClick={() => setEditMode(false)} disabled={isSaving}>
                                            {!isSaving ? 'Done' : <Icon icon={faSpinner} spin />}
                                        </Button>
                                    </InputGroup>
                                </div>
                            )}
                            {enableEdit && !editMode && <StatementActionButton title="Edit classes" icon={faPen} action={() => setEditMode(true)} />}
                        </ClassesStyle>
                    )}
                </div>
            </AnimationContainer>
            {selectedResource && resource._class === ENTITIES.RESOURCE && (
                <ClassesStyle className="text-muted mb-2 d-flex align-items-center clearfix">
                    <Icon icon={faPuzzlePiece} className="me-1" />
                    <span className="text-secondary-darker"> Applied {pluralize('template', usedTemplates?.length ?? 0, false)}: </span>
                    {!isLoading && !isLoadingUsedTemplates && (
                        <div className="mx-1" style={{ padding: '3.5px 0' }}>
                            {usedTemplates?.map((t, index) => (
                                <Fragment key={t.id}>
                                    <TemplateTooltip id={t.id}>
                                        <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                            {t.label}
                                        </Link>
                                    </TemplateTooltip>
                                    {index + 1 !== usedTemplates.length && ', '}
                                </Fragment>
                            ))}
                            {usedTemplates?.length === 0 && <i className="text-secondary-darker">No templates applied</i>}
                        </div>
                    )}
                    {!isLoading && isLoadingUsedTemplates && (
                        <div style={{ padding: '3.5px 0' }}>
                            <i>Loading ...</i>
                        </div>
                    )}
                </ClassesStyle>
            )}
        </>
    );
};

ClassesItem.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
};

export default ClassesItem;
