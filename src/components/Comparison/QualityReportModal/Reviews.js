import InviteResearchersButton from 'components/Comparison/QualityReportModal/InviteResearchersButton';
import REVIEW_QUESTIONS from 'components/Comparison/QualityReportModal/reviewQuestions';
import PropTypes from 'prop-types';
import { Alert, ListGroup, ListGroupItem, Progress } from 'reactstrap';

const Reviews = ({ reviews, comparisonId }) => {
    const questions = REVIEW_QUESTIONS.map(question => ({
        ...question,
        score:
            question.input === 'likert'
                ? Math.round(reviews.reduce((acc, review) => acc + ((parseInt(review[question.id], 10) + 2) / 4) * 100, 0) / reviews.length) || 0
                : undefined,
    }));

    return comparisonId ? (
        <div className="px-3">
            <div className="d-flex justify-content-between align-items-center my-4">
                <p className="m-0">
                    The results displayed below are based on reviews from <strong>{reviews.length} different evaluators</strong>
                </p>
                <div>
                    <InviteResearchersButton comparisonId={comparisonId} />
                </div>
            </div>
            {questions.map(question => (
                <div key={question.id} className="border-top w-100 py-2">
                    {question.question}
                    {question.input === 'likert' && (
                        <div className="d-flex align-items-center my-3">
                            <div className="fw-bold text-end me-2" style={{ width: '20%' }}>
                                {question.score}% agrees
                            </div>
                            <Progress color="primary" value={question.score} className="flex-grow-1" />
                            <div className="fw-bold ms-2" style={{ width: '20%' }}>
                                {question.score ? 100 - question.score : 0}% disagrees
                            </div>
                        </div>
                    )}
                    {question.input === 'textarea' && (
                        <ListGroup className="my-3 mx-5">
                            {reviews.map((review, index) => (
                                <ListGroupItem key={index}>{review[question.id]}</ListGroupItem>
                            ))}
                        </ListGroup>
                    )}
                </div>
            ))}
        </div>
    ) : (
        <Alert color="danger" className="m-3" fade={false}>
            User reviews are not available for unpublished comparisons
        </Alert>
    );
};

Reviews.propTypes = {
    comparisonId: PropTypes.string.isRequired,
    reviews: PropTypes.array.isRequired,
};

export default Reviews;
