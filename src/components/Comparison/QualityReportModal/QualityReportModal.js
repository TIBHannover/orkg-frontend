import { faSpinner, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useQualityReport from 'components/Comparison/QualityReportModal/hooks/useQualityReport';
import Recommendation from 'components/Comparison/QualityReportModal/Recommendation';
import Feedback from 'components/Comparison/QualityReportModal/Feedback';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalHeader, Progress } from 'reactstrap';
import { setIsOpenFeedbackModal } from 'slices/comparisonSlice';
import styled from 'styled-components';

const ButtonTab = styled(Button)`
    &&& {
        color: inherit;
        width: 100%;
        border: 0;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        border-bottom-color: ${(props) => props.theme.light};
        text-decoration: none;
        border-radius: 0;
        padding: 0.7rem 0;
    }
    &.active {
        font-weight: 600;
        border-color: ${(props) => props.theme.primary} !important;
    }
`;

const QualityReportModal = ({ toggle }) => {
    const [selectedTab, setSelectedTab] = useState('recommendations');
    const dispatch = useDispatch();
    const comparisonId = useSelector((state) => state.comparison.comparisonResource.id);
    const { issueRecommendations, passingRecommendations, recommendationsPercentage, feedbacksPercentage, feedbacks, isLoading } = useQualityReport();
    const stars = Math.round(feedbacksPercentage / 20);

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Comparison quality report</ModalHeader>
            <ModalBody className="p-0">
                {!isLoading ? (
                    <>
                        <div className="py-3 bg-light-lighter d-flex">
                            <div className="w-50 border-end px-3">
                                <h6 className="h5">Recommendations</h6>
                                <Progress color="primary" value={recommendationsPercentage} className="w-75 mb-1">
                                    {recommendationsPercentage}%
                                </Progress>
                                Percentage of passing recommendations
                            </div>
                            <div className="w-50 px-3">
                                <h6 className="h5">User feedback</h6>
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faStar} className={stars >= 1 ? 'text-primary' : 'text-light'} />
                                    <FontAwesomeIcon icon={faStar} className={stars >= 2 ? 'text-primary' : 'text-light'} />
                                    <FontAwesomeIcon icon={faStar} className={stars >= 3 ? 'text-primary' : 'text-light'} />
                                    <FontAwesomeIcon icon={faStar} className={stars >= 4 ? 'text-primary' : 'text-light'} />
                                    <FontAwesomeIcon icon={faStar} className={stars >= 5 ? 'text-primary' : 'text-light'} />
                                    <span className="ms-2">Based on {feedbacks.length} evaluations</span>
                                </div>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="primary"
                                    className="mt-2"
                                    onClick={() => {
                                        dispatch(setIsOpenFeedbackModal(true));
                                        // work around: close the quality report modal to ensure data is reloaded after view submission
                                        toggle();
                                    }}
                                >
                                    Write feedback
                                </RequireAuthentication>
                            </div>
                        </div>
                        <div className="d-flex">
                            <ButtonTab
                                color="link"
                                className={selectedTab === 'recommendations' ? 'active' : ''}
                                onClick={() => setSelectedTab('recommendations')}
                            >
                                Recommendations
                            </ButtonTab>
                            <ButtonTab
                                color="link"
                                className={selectedTab === 'feedbacks' ? 'active' : ''}
                                onClick={() => setSelectedTab('feedbacks')}
                            >
                                User feedback
                            </ButtonTab>
                        </div>
                        {selectedTab === 'recommendations' && (
                            <div className="p-3">
                                <h6 className="h5 mb-3">Issues ({issueRecommendations.length})</h6>
                                <ul className="list-unstyled">
                                    {issueRecommendations.map(({ info, evaluation, solution, title }, index) => (
                                        <Recommendation
                                            key={index}
                                            title={title}
                                            info={info}
                                            evaluation={evaluation}
                                            solution={solution}
                                            type="issue"
                                        />
                                    ))}
                                </ul>
                                <h6 className="h5 mb-3">Passing ({passingRecommendations.length})</h6>
                                <ul className="list-unstyled">
                                    {passingRecommendations.map(({ info, evaluation, solution, title }, index) => (
                                        <Recommendation
                                            key={index}
                                            title={title}
                                            info={info}
                                            evaluation={evaluation}
                                            solution={solution}
                                            type="success"
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedTab === 'feedbacks' && <Feedback feedbacks={feedbacks} comparisonId={comparisonId} />}
                    </>
                ) : (
                    <div className="m-5 text-center">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading...
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

QualityReportModal.propTypes = {
    toggle: PropTypes.func.isRequired,
};

export default QualityReportModal;
