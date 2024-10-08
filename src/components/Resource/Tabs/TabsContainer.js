import Tabs from 'components/Tabs/Tabs';
import { Container } from 'reactstrap';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ObjectStatements from 'components/Resource/Tabs/ObjectStatements';
import PreviewFactory from 'components/Resource/Tabs/Preview/PreviewFactory/PreviewFactory';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import useParams from 'components/useParams/useParams';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import ResourceUsage from 'components/Resource/Tabs/ResourceUsage';

function TabsContainer({ id, classes, editMode }) {
    const { activeTab } = useParams();

    const router = useRouter();

    const onTabChange = (key) => {
        router.push(
            `${reverse(ROUTES.RESOURCE_TABS, {
                id,
                activeTab: key,
            })}?noRedirect&isEditMode=${editMode}`,
        );
    };

    return (
        <Container className="mt-3 p-0">
            <Tabs
                className="box rounded"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={activeTab ?? 'information'}
                items={[
                    {
                        label: 'Resource information',
                        key: 'information',
                        children: (
                            <div className="p-4">
                                <StatementBrowser
                                    enableEdit={editMode}
                                    syncBackend={editMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={id}
                                    newStore
                                    propertiesAsLinks
                                    resourcesAsLinks
                                    keyToKeepStateOnLocationChange={id}
                                />
                            </div>
                        ),
                    },
                    ...(classes?.includes(CLASSES.VISUALIZATION)
                        ? [
                              {
                                  label: 'Preview',
                                  key: 'preview',
                                  children: <PreviewFactory id={id} classes={classes} />,
                              },
                          ]
                        : []),
                    /*
                        {
                            label: 'Trend',
                            key: 'trend',
                            children: <Trend id={id} />,
                        }, */
                    {
                        label: 'In papers',
                        key: 'papers',
                        children: <ResourceUsage id={id} />,
                    },

                    {
                        label: 'In statements',
                        key: 'statements',
                        children: <ObjectStatements id={id} />,
                    },
                ]}
            />
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    classes: PropTypes.array,
};

export default TabsContainer;
