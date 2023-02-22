import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'reactstrap';
import { getChildrenByID, getParentByID } from 'services/backend/classes';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

function InformationTab({ id, label, uri, editMode }) {
    const [template, setTemplate] = useState(null);
    const [parent, setParent] = useState(null);
    const [children, setChildren] = useState([]);
    const [showMoreChildren, setShowMoreChildren] = useState(false);

    useEffect(() => {
        const findTemplate = async () => {
            // Get the template of the class
            getStatementsByObjectAndPredicate({
                objectId: id,
                predicateId: PREDICATES.TEMPLATE_OF_CLASS,
            })
                .then(statements =>
                    Promise.all(statements.filter(statement => statement.subject.classes?.includes(CLASSES.TEMPLATE)).map(st => st.subject)),
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
                setChildren(p.content.map(c => c.class));
            });
        };
        findTemplate();
        findParent();
        findChildren();
    }, [id]);

    const _children = !showMoreChildren && children?.length > 0 ? children.slice(0, 9) : children;

    return (
        <div className="p-4" style={{ backgroundColor: '#fff' }}>
            <Table bordered>
                <tbody>
                    <tr>
                        <th scope="row">ID</th>
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
                        <th scope="row">Subclass of</th>
                        <td>
                            <i>
                                {parent ? (
                                    <Link to={reverse(ROUTES.CLASS, { id: parent.id })}>
                                        <DescriptionTooltip id={parent.id} _class={ENTITIES.CLASS}>
                                            {parent.label}
                                        </DescriptionTooltip>
                                    </Link>
                                ) : (
                                    'Not Defined'
                                )}
                            </i>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Has subclasses</th>
                        <td>
                            <i>
                                {_children.length ? (
                                    <>
                                        <ul className="mb-0">
                                            {_children.map(child => (
                                                <li key={child.id}>
                                                    <Link to={reverse(ROUTES.CLASS, { id: child.id })}>
                                                        <DescriptionTooltip id={child.id} _class={ENTITIES.CLASS}>
                                                            {child.label}
                                                        </DescriptionTooltip>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        {children.length > 9 && (
                                            <Button className="p-0 ps-3" onClick={() => setShowMoreChildren(v => !v)} color="link" size="sm">
                                                {showMoreChildren ? 'Show less subclasses' : 'Show more subclasses'}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    'Not Defined'
                                )}
                            </i>
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
            <StatementBrowser
                rootNodeType={ENTITIES.CLASS}
                enableEdit={editMode}
                syncBackend={editMode}
                openExistingResourcesInDialog={false}
                initialSubjectId={id}
                newStore={true}
                propertiesAsLinks={true}
                resourcesAsLinks={true}
            />
        </div>
    );
}

InformationTab.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    uri: PropTypes.string,
    editMode: PropTypes.bool.isRequired,
};

export default InformationTab;
