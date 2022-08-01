import { faAngleDown, faExclamationTriangle, faMagic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Abstract from 'components/AddPaper/Abstract/Abstract';
import EntityRecognition from 'components/AddPaper/EntityRecognition/EntityRecognition';
import useDetermineResearchField from 'components/AddPaper/EntityRecognition/useDetermineResearchField';
import useEntityRecognition from 'components/AddPaper/hooks/useEntityRecognition';
import Confirm from 'components/Confirmation/Confirmation';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import { StyledContributionTabs } from 'components/ContributionTabs/styled';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import Tooltip from 'components/Utils/Tooltip';
import Tabs, { TabPane } from 'rc-tabs';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import {
    createContributionAction as createContribution,
    deleteContributionAction as deleteContribution,
    nextStep,
    openTour,
    previousStep,
    saveAddPaperAction as saveAddPaper,
    selectContributionAction as selectContribution,
    toggleAbstractDialog,
    updateContributionLabelAction as updateContributionLabel,
} from 'slices/addPaperSlice';
import { updateSettings } from 'slices/statementBrowserSlice';
import ContributionsHelpTour from './ContributionsHelpTour';

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
        selectedContribution,
        abstract,
    } = useSelector(state => state.addPaper);
    const { resources, properties, values } = useSelector(state => state.statementBrowser);
    const { isComputerScienceField } = useDetermineResearchField();
    const { handleSaveFeedback } = useEntityRecognition();

    const dispatch = useDispatch();

    useEffect(() => {
        // if there is no contribution yet, create the first one
        if (contributions.allIds.length === 0) {
            dispatch(
                createContribution({
                    selectAfterCreation: true,
                    prefillStatements: true,
                    researchField: selectedResearchField,
                }),
            );
            dispatch(
                updateSettings({
                    openExistingResourcesInDialog: true,
                }),
            );
        }
    }, [contributions.allIds.length, dispatch, selectedResearchField]);

    const handleNextClick = async () => {
        handleSaveFeedback();
        // save add paper
        dispatch(
            saveAddPaper({
                title,
                authors,
                publicationMonth,
                publicationYear,
                doi,
                publishedIn,
                url,
                selectedResearchField,
                contributions,
                resources,
                properties,
                values,
            }),
        );
        dispatch(nextStep());
    };

    const toggleDeleteContribution = async id => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
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
                label,
                contributionId,
                resourceId: contribution.resourceId,
            }),
        );
    };

    const handleLearnMore = step => {
        dispatch(openTour(step));
    };

    const showAbstractWarning = isComputerScienceField && !abstract;
    const onTabChange = key => {
        handleSelectContribution(key);
    };

    const renderTabBar = (props, DefaultTabBar) => (
        <div id="contributionsList">
            <DefaultTabBar {...props} />
        </div>
    );

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
                        tippyProps={{ interactive: true }}
                    >
                        Specify research contributions
                    </Tooltip>
                </h2>
                <div className="flex-shrink-0 ms-auto">
                    <Tippy
                        hideOnClick
                        showOnCreate
                        disabled={!showAbstractWarning}
                        placement="right"
                        content="We were unable to fetch the abstract of the paper. Click the button to manually add it, this improves the smart recommendations"
                    >
                        <span>
                            <Button onClick={() => dispatch(toggleAbstractDialog())} outline size="sm" color="smart">
                                {!showAbstractWarning ? <Icon icon={faMagic} /> : <Icon icon={faExclamationTriangle} className="text-warning" />}{' '}
                                Abstract annotator
                            </Button>
                        </span>
                    </Tippy>
                </div>
            </div>
            <Row className="mt-2 g-0">
                <Col md="9">
                    <StyledContributionTabs>
                        <Tabs
                            renderTabBar={renderTabBar}
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
                                        <div className="contributionData">
                                            <StatementBrowser
                                                enableEdit={true}
                                                syncBackend={false}
                                                openExistingResourcesInDialog={false}
                                                initialSubjectId={contribution.resourceId}
                                                initialSubjectLabel={contribution.label}
                                                renderTemplateBox={true}
                                            />
                                        </div>
                                    </TabPane>
                                );
                            })}
                        </Tabs>
                    </StyledContributionTabs>
                </Col>

                <Col lg="3" className="ps-lg-3 mt-5">
                    {isComputerScienceField && !showAbstractWarning && <EntityRecognition />}
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
