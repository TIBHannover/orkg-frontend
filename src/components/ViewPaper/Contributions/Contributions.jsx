import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import AddToComparison from '@/components/Cards/PaperCard/AddToComparison';
import AddContributionButton from '@/components/ContributionTabs/AddContributionButton';
import ContributionTab from '@/components/ContributionTabs/ContributionTab';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import RosettaStoneStatements from '@/components/RosettaStone/Statements/RosettaStoneStatements';
import Tabs from '@/components/Tabs/Tabs';
import Alert from '@/components/Ui/Alert/Alert';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import useParams from '@/components/useParams/useParams';
import ContributionComparisons from '@/components/ViewPaper/ContributionComparisons/ContributionComparisons';
import AutomaticContributionWarning from '@/components/ViewPaper/Contributions/AutomaticContributionWarning';
import useContributions from '@/components/ViewPaper/Contributions/hooks/useContributions';
import useFetchAbstract from '@/components/ViewPaper/hooks/useFetchAbstract';
import Mentionings from '@/components/ViewPaper/Mentionings/Mentionings';
import ProvenanceBox from '@/components/ViewPaper/ProvenanceBox/ProvenanceBox';
import SmartSuggestions from '@/components/ViewPaper/SmartSuggestions/SmartSuggestions';
import SustainableDevelopmentGoals from '@/components/ViewPaper/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import { EXTRACTION_METHODS } from '@/constants/misc';
import ROUTES from '@/constants/routes';

const Contributions = (props) => {
    const { resourceId, contributionId } = useParams();
    const {
        contributions,
        paperTitle,
        handleAutomaticContributionVerification,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        router,
    } = useContributions({
        paperId: resourceId,
        contributionId,
    });

    const isAddingContribution = useSelector((state) => state.viewPaper.isAddingContribution);

    const researchFieldId = useSelector((state) => state.viewPaper.paper.research_fields?.[0]?.id);

    const onTabChange = (key) => {
        const url =
            key === 'contributions'
                ? reverse(ROUTES.VIEW_PAPER, { resourceId })
                : reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId, contributionId: key });

        router.push(`${url}${props.enableEdit ? `?isEditMode=${props.enableEdit}` : ''}`);
    };

    const { fetchAbstract, isLoading: isLoadingAbstract, abstract } = useFetchAbstract();

    useEffect(() => {
        if (props.enableEdit && !abstract) {
            fetchAbstract();
        }
    }, [props.enableEdit, abstract, fetchAbstract]);

    let selectedTab;

    if (contributionId === 'statements') {
        selectedTab = 'statements';
    } else if (contributionId === 'mentions') {
        selectedTab = 'mentions';
    } else {
        selectedTab = 'contributions';
    }
    let selectedContributionId = null;
    let failedContributionId = false;
    if (contributionId === 'statements' || (!contributionId && !contributions?.length)) {
        selectedContributionId = null;
    }
    if (!contributionId && contributions?.length > 0) {
        selectedContributionId = contributions[0].id;
    }
    if (contributionId && contributions?.some((el) => el.id === contributionId)) {
        selectedContributionId = contributionId;
    }
    if (contributionId && !contributions?.some((el) => el.id === contributionId)) {
        failedContributionId = true;
    }

    return (
        <div>
            <Row>
                <Col md="9">
                    <Tabs
                        more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                        activeKey={selectedTab}
                        destroyOnHidden
                        onChange={onTabChange}
                        className="rounded"
                        style={{ background: '#F8F9FB' }}
                        items={[
                            {
                                label: 'Contributions',
                                key: 'contributions',
                                children: (
                                    <>
                                        {!failedContributionId && (
                                            <Tabs
                                                tabBarExtraContent={
                                                    props.enableEdit ? (
                                                        <AddContributionButton
                                                            disabled={isAddingContribution}
                                                            onClick={() => handleCreateContribution()}
                                                        />
                                                    ) : null
                                                }
                                                more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                                                activeKey={contributionId}
                                                destroyOnHidden
                                                onChange={onTabChange}
                                                items={[
                                                    ...(contributions?.map((contribution) => ({
                                                        label: (
                                                            <ContributionTab
                                                                handleChangeContributionLabel={handleChangeContributionLabel}
                                                                isSelected={contribution.id === contributionId}
                                                                canDelete={contributions.length !== 1}
                                                                contribution={contribution}
                                                                key={contribution.id}
                                                                toggleDeleteContribution={toggleDeleteContribution}
                                                                enableEdit={props.enableEdit}
                                                            />
                                                        ),
                                                        key: contribution.id,
                                                        children: (
                                                            <div
                                                                className="p-4"
                                                                style={{
                                                                    backgroundColor:
                                                                        contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC
                                                                            ? '#ecf6f8'
                                                                            : '',
                                                                }}
                                                            >
                                                                {contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC && (
                                                                    <AutomaticContributionWarning
                                                                        contribution={contribution}
                                                                        onVerifyHandler={handleAutomaticContributionVerification}
                                                                        enableEdit={props.enableEdit}
                                                                    />
                                                                )}
                                                                {selectedContributionId && (
                                                                    <div>
                                                                        <FormGroup>
                                                                            <DataBrowser
                                                                                isEditMode={props.enableEdit}
                                                                                id={selectedContributionId}
                                                                                canEditSharedRootLevel
                                                                                researchField={researchFieldId}
                                                                                title={paperTitle}
                                                                                abstract={abstract}
                                                                            />
                                                                        </FormGroup>

                                                                        {contribution.id && (
                                                                            <ContributionComparisons contributionId={contribution.id} />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    })) ?? []),
                                                ]}
                                            />
                                        )}
                                        {failedContributionId && (
                                            <Alert className="m-3" color="danger">
                                                Contribution doesn't exist
                                            </Alert>
                                        )}
                                        {contributions?.length === 0 && (
                                            <Alert className="m-3 rounded" color="warning">
                                                This paper has no contributions yet
                                                <br />
                                                {props.enableEdit ? (
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        Start by adding a contribution using the top right (+) button
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
                                                )}
                                                <br />
                                            </Alert>
                                        )}
                                    </>
                                ),
                            },
                            {
                                label: 'Statements',
                                key: 'statements',
                                children: (
                                    <div className="p-4">
                                        <RosettaStoneStatements context={resourceId} />
                                    </div>
                                ),
                            },
                            {
                                label: 'Mentions',
                                key: 'mentions',
                                children: (
                                    <div className="p-4">
                                        <Mentionings id={resourceId} />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Col>

                <div className="col-md-3">
                    <SustainableDevelopmentGoals isEditable={props.enableEdit} />

                    {contributions?.length > 0 && (
                        <div className="d-flex mb-3 rounded px-3 py-2" style={{ border: '1px solid rgb(219,221,229)' }}>
                            <AddToComparison showLabel paper={{ id: resourceId, label: paperTitle, contributions }} />
                        </div>
                    )}

                    {selectedContributionId && contributionId !== 'statements' && contributionId !== 'mentions' && props.enableEdit && (
                        <div className="mb-3">
                            <SmartSuggestions
                                isLoadingAbstract={isLoadingAbstract}
                                title={paperTitle}
                                abstract={abstract}
                                resourceId={selectedContributionId}
                            />
                        </div>
                    )}

                    <ProvenanceBox />
                </div>
            </Row>
        </div>
    );
};

Contributions.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
};

export default Contributions;
