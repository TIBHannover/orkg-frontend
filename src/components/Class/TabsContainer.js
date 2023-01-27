import Tabs from 'rc-tabs';
import { GlobalStyle, StyledContributionTabs } from 'components/ContributionTabs/styled';
import { Container, Table } from 'reactstrap';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ClassInstances from 'components/ClassInstances/ClassInstances';
import { ENTITIES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';

function TabsContainer({ id, label, uri, template, editMode }) {
    const { activeTab } = useParams();

    const navigate = useNavigate();

    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.CLASS_TABS, {
                id,
                activeTab: key,
            })}?noRedirect`,
        );
    };

    return (
        <Container className="mt-2 p-0">
            <GlobalStyle />
            <StyledContributionTabs disablePadding={true}>
                <Tabs
                    destroyInactiveTabPane={true}
                    onChange={onTabChange}
                    activeKey={activeTab ?? 'information'}
                    items={[
                        {
                            label: 'Class information',
                            key: 'information',
                            children: (
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
                                                <th scope="row">Template</th>
                                                <td>
                                                    {template ? (
                                                        <Link to={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label}</Link>
                                                    ) : (
                                                        <i>
                                                            Not Defined{' '}
                                                            <Link to={`${reverse(ROUTES.ADD_TEMPLATE)}?classID=${id}`}>Create a template</Link>
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
                            ),
                        },
                        {
                            label: 'Instances',
                            key: 'instances',
                            children: <ClassInstances classId={id} />,
                        },
                    ]}
                />
            </StyledContributionTabs>
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    uri: PropTypes.string,
    template: PropTypes.object,
    editMode: PropTypes.bool.isRequired,
    classes: PropTypes.array,
};

export default TabsContainer;
