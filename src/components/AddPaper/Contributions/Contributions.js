import { useEffect } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import ContributionsHelpTour from './ContributionsHelpTour';
import Tooltip from 'components/Utils/Tooltip';
import {
    nextStep,
    previousStep,
    createContribution,
    deleteContribution,
    selectContribution,
    updateContributionLabel,
    saveAddPaper,
    openTour,
    toggleAbstractDialog
} from 'actions/addPaper';
import { updateSettings } from 'slices/statementBrowserSlice';
import Abstract from 'components/AddPaper/Abstract/Abstract';
import Confirm from 'components/Confirmation/Confirmation';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import { StyledContributionTabs } from 'components/ContributionTabs/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faMagic, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import Tabs, { TabPane } from 'rc-tabs';

const Contributions = () => {
    const {
        title,
        authors,
        publicationMonth,
        publicationYear,
        doi,
        publishedIn,
        url,
        selectedResearchField,
        contributions,
        selectedContribution
    } = useSelector(state => state.addPaper);
    const { resources, properties, values } = useSelector(state => state.statementBrowser);

    const dispatch = useDispatch();

    useEffect(() => {
        // if there is no contribution yet, create the first one
        if (contributions.allIds.length === 0) {
            dispatch(
                createContribution({
                    selectAfterCreation: true,
                    prefillStatements: true,
                    researchField: selectedResearchField
                })
            );
            dispatch(
                updateSettings({
                    openExistingResourcesInDialog: true
                })
            );
        }
    }, [contributions.allIds.length, dispatch, selectedResearchField]);

    const handleNextClick = async () => {
        // save add paper
        dispatch(
            saveAddPaper({
                title: title,
                authors: authors,
                publicationMonth: publicationMonth,
                publicationYear: publicationYear,
                doi: doi,
                publishedIn: publishedIn,
                url: url,
                selectedResearchField: selectedResearchField,
                contributions: contributions,
                resources: resources,
                properties: properties,
                values: values
            })
        );
        dispatch(nextStep());
    };

    const toggleDeleteContribution = async id => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?'
        });

        if (result) {
            // delete the contribution and select the first one in the remaining list
            const selectedId = contributions.allIds.filter(i => i !== id)[0];
            dispatch(deleteContribution({ id, selectAfterDeletion: contributions.byId[selectedId] }));
        }
    };

    const handleSelectContribution = contributionId => {
        dispatch(selectContribution(contributions.byId[contributionId]));
    };

    const handleChange = (contributionId, label) => {
        const contribution = contributions.byId[contributionId];
        dispatch(
            updateContributionLabel({
                label: label,
                contributionId: contributionId,
                resourceId: contribution.resourceId
            })
        );
    };

    const handleLearnMore = step => {
        dispatch(openTour(step));
    };

    const onTabChange = key => {
        handleSelectContribution(key);
    };

    return (
        <div>
            <div className="d-flex align-items-center mt-4 mb-4">
                <h2 className="h4 flex-shrink-0">
                    <Tooltip
                        message={
                            <span>
                                Specify the research contributions that this paper makes. A paper can have multiple contributions and each
                                contribution addresses at least one research problem.{' '}
                                <div
                                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                    onClick={() => handleLearnMore(1)}
                                    onKeyDown={e => {
                                        if (e.keyCode === 13) {
                                            handleLearnMore(1);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    Learn more
                                </div>
                            </span>
                        }
                    >
                        Specify research contributions
                    </Tooltip>
                </h2>
                <div className="flex-shrink-0 ms-auto">
                    <Button onClick={() => dispatch(toggleAbstractDialog())} outline size="sm" color="secondary">
                        <Icon icon={faMagic} /> Abstract annotator
                    </Button>
                </div>
            </div>
            <Row className="mt-2 g-0">
                <Col md="9">
                    <StyledContributionTabs>
                        <Tabs
                            tabBarExtraContent={<AddContributionButton onClick={() => dispatch(createContribution({}))} />}
                            moreIcon={<Icon size="lg" icon={faAngleDown} />}
                            activeKey={selectedContribution}
                            onChange={onTabChange}
                            destroyInactiveTabPane={true}
                        >
                            {contributions.allIds.map(contributionId => {
                                const contribution = contributions.byId[contributionId];
                                return (
                                    <TabPane
                                        tab={
                                            <ContributionTab
                                                handleChangeContributionLabel={handleChange}
                                                isSelected={contribution.id === selectedContribution}
                                                canDelete={contributions.allIds.length !== 1}
                                                contribution={contribution}
                                                key={contribution.id}
                                                toggleDeleteContribution={toggleDeleteContribution}
                                                enableEdit={true}
                                            />
                                        }
                                        key={contribution.id}
                                    >
                                        <StatementBrowser
                                            enableEdit={true}
                                            syncBackend={false}
                                            openExistingResourcesInDialog={false}
                                            initialSubjectId={contribution.resourceId}
                                            initialSubjectLabel={contribution.label}
                                            renderTemplateBox={true}
                                        />
                                    </TabPane>
                                );
                            })}
                        </Tabs>
                    </StyledContributionTabs>
                </Col>
            </Row>

            <hr className="mt-5 mb-3" />

            <Abstract />

            <ContributionsHelpTour />

            <Button color="primary" className="float-end mb-4" onClick={handleNextClick}>
                Finish
            </Button>
            <Button color="light" className="float-end mb-4 me-2" onClick={() => dispatch(previousStep())}>
                Previous step
            </Button>
        </div>
    );
};

export default Contributions;
