import Tabs from 'rc-tabs';
import { GlobalStyle, StyledContributionTabs } from 'components/ContributionTabs/styled';
import { Container } from 'reactstrap';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ObjectStatements from 'components/Resource/Tabs/ObjectStatements';
import PreviewFactory from 'components/Resource/Tabs/Preview/PreviewFactory/PreviewFactory';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import ResourceUsage from './ResourceUsage';
import Trend from './Trend';

function TabsContainer({ id, classes, editMode, canEdit }) {
    const { activeTab } = useParams();

    const navigate = useNavigate();

    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.RESOURCE_TABS, {
                id,
                activeTab: key,
            })}?noRedirect`,
        );
    };

    return (
        <Container className="mt-2 p-0">
            <GlobalStyle />
            <StyledContributionTabs>
                <Tabs
                    destroyInactiveTabPane={true}
                    onChange={onTabChange}
                    activeKey={activeTab ?? 'statements'}
                    items={[
                        {
                            label: 'Statements',
                            key: 'statements',
                            children: (
                                <StatementBrowser
                                    enableEdit={editMode && canEdit}
                                    syncBackend={editMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={id}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                />
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
                        },
                        */
                        {
                            label: 'Papers usage',
                            key: 'papers',
                            children: <ResourceUsage id={id} />,
                        },
                        {
                            label: 'Statement by object',
                            key: 'object',
                            children: <ObjectStatements id={id} />,
                        },
                    ]}
                />
            </StyledContributionTabs>
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    classes: PropTypes.array,
    canEdit: PropTypes.bool.isRequired,
};

export default TabsContainer;
