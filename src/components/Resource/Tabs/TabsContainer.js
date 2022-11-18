import { useState } from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import { GlobalStyle, StyledContributionTabs } from 'components/ContributionTabs/styled';
import { Container } from 'reactstrap';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ObjectStatements from 'components/Resource/Tabs/ObjectStatements';
import PreviewFactory from 'components/Resource/Tabs/Preview/PreviewFactory/PreviewFactory';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import ResourceUsage from './ResourceUsage';
import Trend from './Trend';

function TabsContainer({ id, classes, editMode, canEdit }) {
    return (
        <Container className="mt-2 p-0">
            <GlobalStyle />
            <StyledContributionTabs>
                <Tabs defaultActiveKey="statements" onChange={() => null}>
                    <TabPane tab="Statements" key="statements" className="p-4" style={{ backgroundColor: '#fff' }}>
                        <div className="clearfix">
                            <StatementBrowser
                                enableEdit={editMode && canEdit}
                                syncBackend={editMode}
                                openExistingResourcesInDialog={false}
                                initialSubjectId={id}
                                newStore={true}
                                propertiesAsLinks={true}
                                resourcesAsLinks={true}
                            />
                        </div>
                    </TabPane>
                    {classes?.includes(CLASSES.VISUALIZATION) && (
                        <TabPane tab="Preview" key="preview" style={{ backgroundColor: '#fff' }}>
                            <PreviewFactory id={id} classes={classes} />
                        </TabPane>
                    )}
                    <TabPane tab="Trend" key="trend" className="p-2" style={{ backgroundColor: '#fff' }}>
                        <Trend id={id} />
                    </TabPane>
                    <TabPane tab="Papers usage" key="papers" className="p-0" style={{ backgroundColor: '#fff' }}>
                        <ResourceUsage id={id} />
                    </TabPane>
                    <TabPane tab="Statement by object" className="p-0" key="object" style={{ backgroundColor: '#fff' }}>
                        <ObjectStatements id={id} />
                    </TabPane>
                </Tabs>
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
