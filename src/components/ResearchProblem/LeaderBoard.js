import { useState } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { TransitionGroup } from 'react-transition-group';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import AuthorCard from 'components/AuthorCard/AuthorCard';
import useResearchProblemContributors from './hooks/useResearchProblemContributors';
import useResearchProblemAuthors from './hooks/useResearchProblemAuthors';
import { AnimationContainer, StyledTabsContainerBox, StyledTabs } from './styled';

function LeaderBoard() {
    const [activeTab, setActiveTab] = useState(1);
    const [isContributorsModalOpen, setIsContributorsModalOpen] = useState(false);
    const [isAuthorsModalOpen, setIsAuthorsModalOpen] = useState(false);
    const [
        contributors,
        isLoadingContributors,
        hasNextPageContributors,
        isLastPageReachedContributors,
        currentPageContributors,
        loadMoreResearchProblemContributors
    ] = useResearchProblemContributors();
    const [
        authors,
        isLoadingAuthors,
        hasNextPageAuthors,
        isLastPageReachedAuthors,
        currentPageAuthors,
        loadMoreResearchProblemAuthors
    ] = useResearchProblemAuthors();

    let leaderBoardContent;

    switch (activeTab) {
        case 1:
        default:
            leaderBoardContent = (
                <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <div className="mt-2">
                        {(!isLoadingContributors || currentPageContributors > 1) && (
                            <div>
                                <div className="pl-3 pr-3">
                                    {contributors.slice(0, 3).map((user, index) => {
                                        return (
                                            <div key={`oc${index}`}>
                                                <ContributorCard
                                                    contributor={{
                                                        ...user.user,
                                                        subTitle: `${user.contributions} contributions`
                                                    }}
                                                />

                                                <hr style={{ width: '90%', margin: '10px auto' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                                {contributors.length > 3 && (
                                    <>
                                        <Button
                                            onClick={() => setIsContributorsModalOpen(v => !v)}
                                            className="mt-1 mb-2 mr-3 float-right clearfix p-0"
                                            color="link"
                                        >
                                            <small>+ See more</small>
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                        {isLoadingContributors && currentPageContributors === 1 && (
                            <div className="text-center mt-4 mb-4">Loading contributors ...</div>
                        )}
                        {contributors.length > 3 && (
                            <Modal isOpen={isContributorsModalOpen} toggle={() => setIsContributorsModalOpen(v => !v)} size="lg">
                                <ModalHeader toggle={() => setIsContributorsModalOpen(v => !v)}>Contributors Leaderboard</ModalHeader>
                                <ModalBody>
                                    <div className="pl-3 pr-3">
                                        {contributors.map((user, index) => {
                                            return (
                                                <div key={`moc${index}`}>
                                                    <ContributorCard
                                                        contributor={{
                                                            ...user.user,
                                                            subTitle: `${user.contributions} contributions`
                                                        }}
                                                    />

                                                    <hr style={{ width: '90%', margin: '10px auto' }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {hasNextPageContributors && (
                                        <div
                                            style={{ cursor: 'pointer' }}
                                            className="list-group-item list-group-item-action text-center mt-2"
                                            onClick={!isLoadingContributors ? loadMoreResearchProblemContributors : undefined}
                                        >
                                            Load more contributors
                                        </div>
                                    )}
                                    {!hasNextPageContributors && isLastPageReachedContributors && (
                                        <div className="text-center mt-3">You have reached the last page.</div>
                                    )}
                                </ModalBody>
                            </Modal>
                        )}
                    </div>
                </AnimationContainer>
            );
            break;
        case 2:
            leaderBoardContent = (
                <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <div className="mt-2">
                        {(!isLoadingAuthors || currentPageAuthors > 1) && (
                            <div>
                                <div className="pl-3 pr-3">
                                    {authors.slice(0, 3).map((user, index) => {
                                        return (
                                            <div key={`oc${index}`}>
                                                <AuthorCard author={user.author} subTitle={`${user.papers} paper`} />
                                                <hr style={{ width: '90%', margin: '10px auto' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                                {authors.length > 3 && (
                                    <>
                                        <Button
                                            onClick={() => setIsAuthorsModalOpen(v => !v)}
                                            className="mt-1 mb-2 mr-3 float-right clearfix p-0"
                                            color="link"
                                        >
                                            <small>+ See more</small>
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                        {isLoadingAuthors && currentPageAuthors === 1 && <div className="text-center mt-4 mb-4">Loading authors ...</div>}
                        {authors.length > 3 && (
                            <Modal isOpen={isAuthorsModalOpen} toggle={() => setIsAuthorsModalOpen(v => !v)} size="lg">
                                <ModalHeader toggle={() => setIsAuthorsModalOpen(v => !v)}>Authors</ModalHeader>
                                <ModalBody>
                                    <div className="pl-3 pr-3">
                                        {authors.map((user, index) => {
                                            return (
                                                <div key={`moc${index}`}>
                                                    <AuthorCard author={user.author} subTitle={`${user.papers} paper`} />

                                                    <hr style={{ width: '90%', margin: '10px auto' }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {hasNextPageAuthors && (
                                        <div
                                            style={{ cursor: 'pointer' }}
                                            className="list-group-item list-group-item-action text-center mt-2"
                                            onClick={!isLoadingAuthors ? loadMoreResearchProblemAuthors : undefined}
                                        >
                                            Load more authors
                                        </div>
                                    )}
                                    {!hasNextPageAuthors && isLastPageReachedAuthors && (
                                        <div className="text-center mt-3">You have reached the last page.</div>
                                    )}
                                </ModalBody>
                            </Modal>
                        )}
                    </div>
                </AnimationContainer>
            );
            break;
    }
    return (
        <StyledTabsContainerBox className="box rounded-lg">
            <StyledTabs className="clearfix d-flex">
                <div className={`h6 col-md-6 text-center tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                    Contributors
                </div>
                <div className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                    Authors
                </div>
            </StyledTabs>
            <TransitionGroup exit={false} className="pt-4 pb-4 flex-grow-1">
                {leaderBoardContent}
            </TransitionGroup>
        </StyledTabsContainerBox>
    );
}

export default LeaderBoard;
