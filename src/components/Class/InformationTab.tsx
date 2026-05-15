import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Button, Chip, toast } from '@heroui/react';
import { orderBy } from 'lodash';
import Link from 'next/link';
import { FC, ReactNode, useState } from 'react';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import ClassInlineItem from '@/components/Class/ClassInlineItem/ClassInlineItem';
import useCountInstances from '@/components/Class/hooks/useCountInstances';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import useAuthentication from '@/components/hooks/useAuthentication';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, deleteParentByID, getChildrenByID, getParentByID, setParentClassByID } from '@/services/backend/classes';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Class } from '@/services/backend/types';
import { getErrorMessage } from '@/utils';

type InformationTabProps = {
    id: string;
    classObject?: Class;
    editMode: boolean;
    callBackToReloadTree: () => void;
};

type RowProps = {
    label: string;
    children: ReactNode;
};

const Row: FC<RowProps> = ({ label, children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 py-3 border-b border-gray-200 last:border-b-0">
        <div className="sm:col-span-3 font-medium text-sm text-muted">{label}</div>
        <div className="sm:col-span-9 min-w-0 break-words">{children}</div>
    </div>
);

const InformationTab: FC<InformationTabProps> = ({ id, classObject, editMode, callBackToReloadTree }) => {
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

    const rsTemplate = rsTemplateStatements && rsTemplateStatements.length > 0 ? rsTemplateStatements[0].subject : null;
    const template = templateStatements && templateStatements.length > 0 ? templateStatements[0].subject : null;

    const { data: parent, mutate: mutateParent } = useSWR([id, classesUrl, 'getParentByID'], async ([params]) => {
        try {
            return await getParentByID(params);
        } catch {
            return null;
        }
    });
    const { data: childrenObjects, mutate: mutateChildren } = useSWR([{ id }, classesUrl, 'getChildrenByID'], ([params]) => getChildrenByID(params));

    const children = orderBy(childrenObjects?.content.map((c: { _class: Class }) => c._class) ?? [], [(c: Class) => c.label.toLowerCase()], ['asc']);

    const visibleChildren = !showMoreChildren && children.length > 9 ? children.slice(0, 9) : children;

    return (
        <div className="p-6">
            <div className="rounded border border-gray-200 px-4 mb-4">
                <Row label="URI">
                    {classObject?.uri && classObject.uri !== 'null' ? (
                        <a href={classObject.uri} className="break-all">
                            {classObject.uri}
                        </a>
                    ) : (
                        <span className="italic text-muted">Not defined</span>
                    )}
                </Row>

                <Row label="Number of instances">
                    {isLoadingCount ? (
                        <span className="text-muted">Loading...</span>
                    ) : (
                        <Chip size="sm" variant="soft">
                            {countInstances}
                        </Chip>
                    )}
                </Row>

                <Row label="Subclass of">
                    <ClassInlineItem
                        classObject={parent}
                        editMode={editMode}
                        $displayButtonOnHover={false}
                        onChange={async (_parent: Class) => {
                            if (parent) {
                                await deleteParentByID(id);
                            }
                            try {
                                await setParentClassByID(id, _parent.id);
                                mutateParent();
                            } catch (e) {
                                toast.danger(`Error adding parent class! ${getErrorMessage(e as Error) ?? (e as Error)?.message}`);
                            }
                            callBackToReloadTree();
                        }}
                        onDelete={async () => {
                            await deleteParentByID(id);
                            mutateParent();
                            callBackToReloadTree();
                        }}
                    />
                </Row>

                <Row label="Has subclasses">
                    <div className="flex flex-col">
                        {visibleChildren.length > 0 && (
                            <div className="flex flex-col divide-y divide-gray-100">
                                {visibleChildren.map((child: Class) => (
                                    <ClassInlineItem
                                        key={child.id}
                                        classObject={child}
                                        editMode={editMode}
                                        onChange={() => {}}
                                        onDelete={async () => {
                                            try {
                                                await deleteParentByID(child.id);
                                                mutateChildren();
                                            } catch (e) {
                                                toast.danger(`Error removing subclass! ${getErrorMessage(e as Error) ?? (e as Error)?.message}`);
                                            }
                                            callBackToReloadTree();
                                        }}
                                        noValueMessage=""
                                    />
                                ))}
                            </div>
                        )}

                        {children.length > 9 && (
                            <Button variant="ghost" size="sm" className="self-start px-0 mt-1" onPress={() => setShowMoreChildren((v) => !v)}>
                                {showMoreChildren ? 'Show less subclasses' : `Show more subclasses (${children.length - 9})`}
                            </Button>
                        )}

                        {isCurationAllowed && editMode && (
                            <div className={visibleChildren.length > 0 ? 'mt-2 pt-2 border-t border-dashed border-gray-200' : ''}>
                                <ClassInlineItem
                                    classObject={null}
                                    editMode={editMode}
                                    $displayButtonOnHover={false}
                                    noValueMessage=""
                                    showParentFieldForCreate={false}
                                    onDelete={() => {}}
                                    onChange={async (child: Class) => {
                                        try {
                                            await setParentClassByID(child.id, id);
                                            mutateChildren();
                                        } catch (e) {
                                            toast.danger(`Error adding subclass! ${getErrorMessage(e as Error) ?? (e as Error)?.message}`);
                                        }
                                        callBackToReloadTree();
                                    }}
                                />
                            </div>
                        )}

                        {!editMode && visibleChildren.length === 0 && <span className="italic text-muted">Not defined</span>}
                        {editMode && visibleChildren.length === 0 && !isCurationAllowed && (
                            <span className="inline-flex items-center gap-2 italic text-muted">
                                Not defined
                                <ActionButton title="Editing requires a curator role" icon={faPen} action={() => {}} isDisabled />
                            </span>
                        )}
                    </div>
                </Row>

                {rsTemplate ? (
                    <Row label="Statement template">
                        <Link href={reverse(ROUTES.RS_TEMPLATE, { id: rsTemplate.id })}>{rsTemplate.label}</Link>
                    </Row>
                ) : (
                    <Row label="Template">
                        {template ? (
                            <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label}</Link>
                        ) : (
                            <span className="inline-flex items-center gap-2 italic text-muted">
                                Not defined
                                <Link href={`${reverse(ROUTES.ADD_TEMPLATE)}?classID=${id}`} className="not-italic">
                                    Create a template
                                </Link>
                            </span>
                        )}
                    </Row>
                )}
            </div>

            <DataBrowser isEditMode={editMode} id={id} showHeader={false} propertiesAsLinks valuesAsLinks />
        </div>
    );
};

export default InformationTab;
