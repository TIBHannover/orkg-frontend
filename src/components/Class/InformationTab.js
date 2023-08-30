import { faPen } from '@fortawesome/free-solid-svg-icons';
import ClassInlineItem from 'components/Class/ClassInlineItem/ClassInlineItem';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import useCountInstances from 'components/Class/hooks/useCountInstances';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { orderBy } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Table } from 'reactstrap';
import { deleteParentByID, getChildrenByID, getParentByID, setParentClassByID } from 'services/backend/classes';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getErrorMessage } from 'utils';

function InformationTab({ id, label, uri, editMode, callBackToReloadTree, showStatementsBrowser }) {
    const [template, setTemplate] = useState(null);
    const [parent, setParent] = useState(null);
    const [children, setChildren] = useState([]);
    const { countInstances, isLoading: isLoadingCount } = useCountInstances(id);
    const [showMoreChildren, setShowMoreChildren] = useState(false);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    useEffect(() => {
        const findTemplate = async () => {
            // Get the template of the class
            getStatementsByObjectAndPredicate({
                objectId: id,
                predicateId: PREDICATES.SHACL_TARGET_CLASS,
            })
                .then(statements =>
                    Promise.all(statements.filter(statement => statement.subject.classes?.includes(CLASSES.NODE_SHAPE)).map(st => st.subject)),
                )
                .then(templates => {
                    if (templates.length > 0) {
                        setTemplate(templates[0]);
                    } else {
                        setTemplate(null);
                    }
                });
        };
        const findParent = async () => {
            getParentByID(id).then(p => {
                setParent(p);
            });
        };
        const findChildren = async () => {
            getChildrenByID({ id }).then(p => {
                setChildren(
                    orderBy(
                        p.content.map(c => c.class),
                        [c => c.label.toLowerCase()],
                        ['asc'],
                    ),
                );
            });
        };
        findTemplate();
        findParent();
        findChildren();
    }, [id]);

    const _children = !showMoreChildren && children?.length > 0 ? children.slice(0, 9) : children;

    return (
        <div className="p-4">
            <Table bordered>
                <tbody>
                    <tr>
                        <th className="col-4" scope="row">
                            ID
                        </th>
                        <td> {id}</td>
                    </tr>
                    <tr>
                        <th scope="row">Label</th>
                        <td>
                            {label || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">URI</th>
                        <td>
                            <i>{uri && uri !== 'null' ? <a href={uri}>{uri}</a> : 'Not Defined'}</i>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Number of instances</th>
                        <td>
                            {isLoadingCount && 'Loading...'}
                            {!isLoadingCount && countInstances}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Subclass of</th>
                        <td>
                            <ClassInlineItem
                                classObject={parent}
                                editMode={editMode}
                                displayButtonOnHover={false}
                                onChange={async _parent => {
                                    if (parent) {
                                        await deleteParentByID(id);
                                    }
                                    try {
                                        await setParentClassByID(id, _parent.id);
                                        setParent(_parent);
                                    } catch (e) {
                                        toast.error(`Error adding parent class! ${getErrorMessage(e) ?? e?.message}`);
                                    }
                                    callBackToReloadTree();
                                }}
                                onDelete={async () => {
                                    await deleteParentByID(id);
                                    setParent(null);
                                    callBackToReloadTree();
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Has subclasses</th>
                        <td>
                            {_children?.length > 0 && (
                                <>
                                    {_children.map(child => (
                                        <div key={child.id}>
                                            <ClassInlineItem
                                                classObject={child}
                                                editMode={editMode}
                                                onDelete={async () => {
                                                    try {
                                                        await deleteParentByID(child.id);
                                                        setChildren(prev => prev.filter(c => c.id !== child.id));
                                                    } catch (e) {
                                                        toast.error(`Error removing subclass! ${getErrorMessage(e) ?? e?.message}`);
                                                    }
                                                    callBackToReloadTree();
                                                }}
                                                noValueMessage={null}
                                            />
                                        </div>
                                    ))}

                                    {children.length > 9 && (
                                        <Button className="p-0 ps-0 mb-1" onClick={() => setShowMoreChildren(v => !v)} color="link" size="sm">
                                            {showMoreChildren ? 'Show less subclasses' : 'Show more subclasses'}
                                        </Button>
                                    )}
                                </>
                            )}
                            <div>
                                {isCurationAllowed && editMode && (
                                    <ClassInlineItem
                                        classObject={null}
                                        editMode={editMode}
                                        displayButtonOnHover={false}
                                        noValueMessage={null}
                                        showParentFieldForCreate={false}
                                        onChange={async chil => {
                                            try {
                                                await setParentClassByID(chil.id, id);
                                                setChildren(prev => [...prev, chil]);
                                            } catch (e) {
                                                toast.error(`Error adding subclass! ${getErrorMessage(e) ?? e?.message}`);
                                            }
                                            callBackToReloadTree();
                                        }}
                                    />
                                )}
                                {!editMode && _children?.length === 0 && 'Not defined'}
                                {editMode && _children?.length === 0 && !isCurationAllowed && (
                                    <>
                                        Not defined
                                        <span className="ms-2">
                                            <StatementActionButton
                                                title="Editing requires a curator role"
                                                icon={faPen}
                                                action={null}
                                                isDisabled={true}
                                            />
                                        </span>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Template</th>
                        <td>
                            {template ? (
                                <Link to={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label}</Link>
                            ) : (
                                <i>
                                    Not Defined <Link to={`${reverse(ROUTES.ADD_TEMPLATE)}?classID=${id}`}>Create a template</Link>
                                </i>
                            )}
                        </td>
                    </tr>
                </tbody>
            </Table>

            {showStatementsBrowser && (
                <StatementBrowser
                    rootNodeType={ENTITIES.CLASS}
                    enableEdit={editMode}
                    syncBackend={editMode}
                    openExistingResourcesInDialog={false}
                    initialSubjectId={id}
                    newStore={true}
                    propertiesAsLinks={true}
                    resourcesAsLinks={true}
                    keyToKeepStateOnLocationChange={id}
                />
            )}
        </div>
    );
}

InformationTab.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    uri: PropTypes.string,
    editMode: PropTypes.bool.isRequired,
    callBackToReloadTree: PropTypes.func,
    showStatementsBrowser: PropTypes.bool,
};

InformationTab.defaultProps = {
    showStatementsBrowser: true,
};

export default InformationTab;
