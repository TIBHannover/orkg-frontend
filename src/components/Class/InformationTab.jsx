import { faPen } from '@fortawesome/free-solid-svg-icons';
import { orderBy } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import ClassInlineItem from '@/components/Class/ClassInlineItem/ClassInlineItem';
import useCountInstances from '@/components/Class/hooks/useCountInstances';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import useAuthentication from '@/components/hooks/useAuthentication';
import Button from '@/components/Ui/Button/Button';
import Table from '@/components/Ui/Table/Table';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { classesUrl, deleteParentByID, getChildrenByID, getParentByID, setParentClassByID } from '@/services/backend/classes';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { getErrorMessage } from '@/utils';

function InformationTab({ id, classObject, editMode, callBackToReloadTree }) {
    const { countInstances, isLoading: isLoadingCount } = useCountInstances(id);
    const [showMoreChildren, setShowMoreChildren] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    const { data: rsTemplateStatements } = useSWR(
        [{ subjectClasses: [CLASSES.ROSETTA_NODE_SHAPE], objectId: id, predicateId: PREDICATES.SHACL_TARGET_CLASS }, statementsUrl, 'getStatements'],
        ([params]) => getStatements(params),
    );

    const { data: templateStatements } = useSWR(
        [{ subjectClasses: [CLASSES.NODE_SHAPE], objectId: id, predicateId: PREDICATES.SHACL_TARGET_CLASS }, statementsUrl, 'getStatements'],
        ([params]) => getStatements(params),
    );

    const rsTemplate = rsTemplateStatements?.length > 0 ? rsTemplateStatements[0].subject : null;
    const template = templateStatements?.length > 0 ? templateStatements[0].subject : null;

    const { data: parent, mutate: mutateParent } = useSWR([id, classesUrl, 'getParentByID'], ([params]) => getParentByID(params));
    const { data: childrenObjects, mutate: mutateChildren } = useSWR([{ id }, classesUrl, 'getChildrenByID'], ([params]) => getChildrenByID(params));

    const children = orderBy(
        childrenObjects?.content.map((c) => c.class),
        [(c) => c.label.toLowerCase()],
        ['asc'],
    );

    const _children = !showMoreChildren && children?.length > 0 ? children.slice(0, 9) : children;

    return (
        <div className="p-4">
            <Table bordered>
                <tbody>
                    <tr>
                        <th scope="row" style={{ width: '30%' }}>
                            URI
                        </th>
                        <td>
                            <i>{classObject?.uri && classObject.uri !== 'null' ? <a href={classObject.uri}>{classObject.uri}</a> : 'Not defined'}</i>
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
                                onChange={async (_parent) => {
                                    if (parent) {
                                        await deleteParentByID(id);
                                    }
                                    try {
                                        await setParentClassByID(id, _parent.id);
                                        mutateParent();
                                    } catch (e) {
                                        toast.error(`Error adding parent class! ${getErrorMessage(e) ?? e?.message}`);
                                    }
                                    callBackToReloadTree();
                                }}
                                onDelete={async () => {
                                    await deleteParentByID(id);
                                    mutateParent();
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
                                    {_children.map((child) => (
                                        <div key={child.id}>
                                            <ClassInlineItem
                                                classObject={child}
                                                editMode={editMode}
                                                onDelete={async () => {
                                                    try {
                                                        await deleteParentByID(child.id);
                                                        mutateChildren();
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
                                        <Button className="p-0 ps-0 mb-1" onClick={() => setShowMoreChildren((v) => !v)} color="link" size="sm">
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
                                        onChange={async (chil) => {
                                            try {
                                                await setParentClassByID(chil.id, id);
                                                mutateChildren();
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
                                            <ActionButton title="Editing requires a curator role" icon={faPen} action={null} isDisabled />
                                        </span>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                    {rsTemplate ? (
                        <tr>
                            <th scope="row">Statement template</th>
                            <td>
                                <Link href={reverse(ROUTES.RS_TEMPLATE, { id: rsTemplate.id })}>{rsTemplate.label}</Link>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <th scope="row">Template</th>
                            <td>
                                {template ? (
                                    <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label}</Link>
                                ) : (
                                    <i>
                                        Not defined <Link href={`${reverse(ROUTES.ADD_TEMPLATE)}?classID=${id}`}>Create a template</Link>
                                    </i>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <DataBrowser isEditMode={editMode} id={id} showHeader={false} propertiesAsLinks valuesAsLinks />
        </div>
    );
}

InformationTab.propTypes = {
    id: PropTypes.string.isRequired,
    classObject: PropTypes.object,
    editMode: PropTypes.bool.isRequired,
    callBackToReloadTree: PropTypes.func,
};

export default InformationTab;
