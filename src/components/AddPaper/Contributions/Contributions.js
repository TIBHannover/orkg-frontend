import { useEffect } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import ContributionItemList from './ContributionItemList';
import ContributionsHelpTour from './ContributionsHelpTour';
import Tooltip from 'components/Utils/Tooltip';
import { AddContribution, StyledHorizontalContributionsList } from './styled';
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
import Abstract from 'components/AddPaper/Abstract/Abstract';
import Confirm from 'reactstrap-confirm';
import Contribution from './Contribution';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faMagic, faPlus } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { updateSettings } from 'actions/statementBrowser';

const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter-active {
        opacity: 1;
        transition: 0.7s opacity;
    }
`;

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
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
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
                <div className="flex-shrink-0 ml-auto">
                    <Button onClick={() => dispatch(toggleAbstractDialog())} outline size="sm" color="secondary">
                        <Icon icon={faMagic} /> Abstract annotator
                    </Button>
                </div>
            </div>
            <Row noGutters={true} className="mt-2">
                <Col md="9">
                    <StyledHorizontalContributionsList id="contributionsList">
                        {contributions.allIds.map((contributionId, index) => {
                            const contribution = contributions.byId[contributionId];

                            return (
                                <ContributionItemList
                                    handleChangeContributionLabel={handleChange}
                                    isSelected={contributionId === selectedContribution}
                                    canDelete={contributions.allIds.length !== 1}
                                    selectedContributionId={selectedContribution}
                                    contribution={contribution}
                                    key={contributionId}
                                    toggleDeleteContribution={toggleDeleteContribution}
                                    handleSelectContribution={handleSelectContribution}
                                    enableEdit={true}
                                />
                            );
                        })}

                        <li>
                            <AddContribution color="link" onClick={() => dispatch(createContribution({}))}>
                                <Tippy content="Add contribution">
                                    <span>
                                        <Icon size="xs" icon={faPlus} />
                                    </span>
                                </Tippy>
                            </AddContribution>
                        </li>
                    </StyledHorizontalContributionsList>
                </Col>

                <TransitionGroup className="col-md-9" exit={false}>
                    <AnimationContainer classNames="fadeIn" timeout={{ enter: 700, exit: 0 }} key={selectedContribution}>
                        <div>
                            <Contribution id={selectedContribution} />
                        </div>
                    </AnimationContainer>
                </TransitionGroup>
            </Row>

            <hr className="mt-5 mb-3" />

            <Abstract />

            <ContributionsHelpTour />

            <Button color="primary" className="float-right mb-4" onClick={handleNextClick}>
                Finish
            </Button>
            <Button color="light" className="float-right mb-4 mr-2" onClick={() => dispatch(previousStep())}>
                Previous step
            </Button>
        </div>
    );
};

export default Contributions;
