/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-undef */
import env from '@beam-australia/react-env';
import { faAngleDown, faExclamationTriangle, faFlask, faMagic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Abstract from 'components/AddPaper/Abstract/Abstract';
import AbstractModal from 'components/AddPaper/AbstractModal/AbstractModal';
import BioAssaysModal from 'components/AddPaper/BioAssaysModal/BioAssaysModal';
import EntityRecognition from 'components/AddPaper/EntityRecognition/EntityRecognition';
import useBioassays from 'components/AddPaper/hooks/useBioassays';
import useEntityRecognition from 'components/AddPaper/hooks/useEntityRecognition';
import useFeedbacks from 'components/AddPaper/hooks/useFeedbacks';
import Confirm from 'components/Confirmation/Confirmation';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import Tabs from 'components/Tabs/Tabs';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { BIOASSAYS_FIELDS_LIST } from 'constants/nlpFieldLists';
import Classes from 'pages/Classes/Classes';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Row, UncontrolledAlert } from 'reactstrap';
import { determineActiveNERService } from 'services/orkgNlp/index';

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
    const [isOpenAbstractModal, setIsOpenAbstractModal] = useState(false);
    const [activeNERService, setActiveNERService] = useState(null);
    const { resources, properties, values } = useSelector(state => state.statementBrowser);

    const isBioassayField = BIOASSAYS_FIELDS_LIST.includes(selectedResearchField);

    const { handleSaveFeedback } = useEntityRecognition({ activeNERService });
    const { handleSaveBioassaysFeedback } = useBioassays();
    const { handleSavePredicatesRecommendationFeedback } = useFeedbacks();

    const [isOpenBioassays, setIsOpenBioassays] = useState(false);

    const dispatch = useDispatch();
    const method = useSelector(state => state.addPaper.method);
    const results = useSelector(state => state.addPaper.result);
    const researchProblem = useSelector(state => state.addPaper.researchProblem);
    const conclusion = useSelector(state => state.addPaper.conclusion);
    const objective = useSelector(state => state.addPaper.objective);
    const extractedResearchField = useSelector(state => state.addPaper.extractedResearchField);
    const extractedResearchFieldId = useSelector(state => state.addPaper.extractedResearchFieldId);
    const error = useSelector(state => state.addPaper.predicateError);
    const resourceUri = useSelector(state => state.addPaper.resourceUri);
    const resourceId = resourceUri.split('/').pop();
    const researchProblemLink = useSelector(state => state.addPaper.researchProblemLink);

    useEffect(() => {
        (async () => setActiveNERService(await determineActiveNERService(selectedResearchField)))();
    }, [selectedResearchField]);

    useEffect(() => {
        // if there is no contribution yet, create the first one
        if (contributions.allIds.length === 0) {
            dispatch(
                createContribution({
                    selectAfterCreation: true,
                    fillStatements: true,
                    researchField: extractedResearchFieldId || selectedResearchField,
                    statements: {
                        properties: (() => {
                            const property = [];
                            if (researchProblem) {
                                property.push({
                                    existingPredicateId: PREDICATES.HAS_RESEARCH_PROBLEM,
                                    propertyId: PREDICATES.HAS_RESEARCH_PROBLEM,
                                    label: 'research problem',
                                });
                            }
                            if (method) {
                                property.push({ existingPredicateId: PREDICATES.METHOD, propertyId: PREDICATES.METHOD, label: 'method' });
                            }
                            if (conclusion) {
                                property.push({ propertyId: PREDICATES.CONCLUSION, label: 'conclusion' });
                            }
                            if (objective) {
                                property.push({ propertyId: PREDICATES.OBJECTIVE, label: 'objective' });
                            }
                            if (results) {
                                property.push({
                                    propertyId: PREDICATES.HAS_RESULTS,
                                    label: 'result',
                                });
                            }
                            if (error) {
                                property.push({
                                    propertyId: PREDICATES.HAS_ERROR,
                                    label: 'error',
                                });
                            }
                            return property;
                        })(),

                        values: (() => {
                            const valuesArray = [];
                            if (researchProblem) {
                                valuesArray.push({
                                    isExistingValue: true,
                                    valueId: resourceId,
                                    _class: ENTITIES.RESOURCE,
                                    classes: [CLASSES.PROBLEM],
                                    label: researchProblemLink,
                                    existingResourceId: resourceId,
                                    propertyId: PREDICATES.HAS_RESEARCH_PROBLEM,
                                    existingPredicateId: PREDICATES.HAS_RESEARCH_PROBLEM,
                                });
                            }
                            if (method) {
                                valuesArray.push({
                                    _class: 'literal',
                                    label: method,
                                    propertyId: PREDICATES.METHOD,
                                    existingPredicateId: PREDICATES.METHOD,
                                });
                            }
                            if (conclusion) {
                                valuesArray.push({
                                    _class: 'literal',
                                    label: conclusion,
                                    propertyId: PREDICATES.CONCLUSION,
                                });
                            }
                            if (objective) {
                                valuesArray.push({
                                    _class: 'literal',
                                    label: objective,
                                    propertyId: PREDICATES.OBJECTIVE,
                                });
                            }
                            if (results) {
                                valuesArray.push({
                                    _class: 'literal',
                                    label: results,
                                    propertyId: PREDICATES.HAS_RESULTS,
                                });
                            }
                            if (error) {
                                valuesArray.push({
                                    _class: 'literal',
                                    label: error,
                                    propertyId: PREDICATES.HAS_ERROR,
                                });
                            }
                            return valuesArray;
                        })(),
                    },
                }),
            );
            dispatch(
                updateSettings({
                    openExistingResourcesInDialog: true,
                }),
            );
        }
    }, [contributions.allIds.length, dispatch, selectedResearchField, extractedResearchFieldId]);

    const handleNextClick = async () => {
        if (activeNERService) {
            // handleSaveFeedback();
        }
        if (isBioassayField) {
            handleSaveBioassaysFeedback();
        }
        if (env('IS_TESTING_SERVER') === 'true') {
            // because this feature is disabled in production
            handleSavePredicatesRecommendationFeedback(properties);
        }

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
                extractedResearchField,
                extractedResearchFieldId,
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

    const showAbstractWarning = activeNERService && !abstract;
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
                    {isBioassayField && (
                        <Button onClick={() => setIsOpenBioassays(v => !v)} outline size="sm" color="smart" className="me-1">
                            <Icon icon={faFlask} /> Add Bioassay
                        </Button>
                    )}
                    {!activeNERService ? (
                        <Button onClick={() => dispatch(toggleAbstractDialog())} outline size="sm" color="smart">
                            {!showAbstractWarning ? <Icon icon={faMagic} /> : <Icon icon={faExclamationTriangle} className="text-warning" />} Abstract
                            annotator
                        </Button>
                    ) : (
                        <Tippy
                            showOnCreate
                            delay="1000"
                            disabled={!showAbstractWarning}
                            placement="right"
                            content="We were unable to fetch the abstract of the paper. Click the button to manually add it, this improves the suggestions."
                        >
                            <span>
                                <Button onClick={() => setIsOpenAbstractModal(true)} outline size="sm" color="smart">
                                    {!showAbstractWarning ? <Icon icon={faMagic} /> : <Icon icon={faExclamationTriangle} className="text-warning" />}{' '}
                                    Paper abstract
                                </Button>
                            </span>
                        </Tippy>
                    )}
                </div>
            </div>
            {isBioassayField && (
                <UncontrolledAlert color="info">
                    To add a Bioassay, please click the 'Add Bioassay' button above. This feature lets you insert and curate an automatically
                    semantified version of your assay text by our machine learning system.
                </UncontrolledAlert>
            )}
            <Row className="mt-2 g-0">
                <Col md="9">
                    <Tabs
                        renderTabBar={renderTabBar}
                        tabBarExtraContent={<AddContributionButton onClick={() => dispatch(createContribution({ selectAfterCreation: true }))} />}
                        moreIcon={<Icon size="lg" icon={faAngleDown} />}
                        activeKey={selectedContribution}
                        onChange={onTabChange}
                        destroyInactiveTabPane={true}
                        items={contributions.allIds.map(contributionId => {
                            const contribution = contributions.byId[contributionId];
                            return {
                                label: (
                                    <ContributionTab
                                        handleChangeContributionLabel={handleChange}
                                        isSelected={contribution.id === selectedContribution}
                                        canDelete={contributions.allIds.length !== 1}
                                        contribution={contribution}
                                        key={contribution.id}
                                        toggleDeleteContribution={toggleDeleteContribution}
                                        enableEdit={true}
                                    />
                                ),
                                key: contribution.id,
                                children: (
                                    <div className="contributionData p-4">
                                        <StatementBrowser
                                            enableEdit={true}
                                            syncBackend={false}
                                            openExistingResourcesInDialog={false}
                                            initialSubjectId={contribution.resourceId}
                                            initialSubjectLabel={contribution.label}
                                            renderTemplateBox={true}
                                        />
                                    </div>
                                ),
                            };
                        })}
                    />
                </Col>

                <Col lg="3" className="ps-lg-3 mt-2">
                    <EntityRecognition activeNERService={activeNERService} />
                </Col>
            </Row>

            <hr className="mt-5 mb-3" />

            <Abstract />

            {isBioassayField && (
                <BioAssaysModal selectedResource={selectedContribution} showDialog={isOpenBioassays} toggle={() => setIsOpenBioassays(v => !v)} />
            )}

            <ContributionsHelpTour />

            <Button color="primary" className="float-end mb-4" onClick={handleNextClick}>
                Finish
            </Button>
            <Button color="light" className="float-end mb-4 me-2" onClick={() => dispatch(previousStep())}>
                Previous step
            </Button>
            {isOpenAbstractModal && <AbstractModal toggle={() => setIsOpenAbstractModal(v => !v)} />}
        </div>
    );
};

export default Contributions;
