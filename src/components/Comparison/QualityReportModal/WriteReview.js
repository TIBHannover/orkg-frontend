import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import InviteResearchersButton from 'components/Comparison/QualityReportModal/InviteResearchersButton';
import reviewQuestions from 'components/Comparison/QualityReportModal/reviewQuestions';
import { PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { createResourceStatement } from 'services/backend/statements';
import { createResourceData } from 'services/similarity/index';

const WriteReview = ({ toggle }) => {
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const userId = useSelector(state => state.auth.user?.id);
    const comparisonId = useSelector(state => state.comparison.comparisonResource.id);
    const comparisonCreator = useSelector(state => state.comparison.comparisonResource.created_by);

    const handleChange = e => {
        setAnswers({
            ...answers,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < reviewQuestions.length) {
            toast.error('Please answer all questions');
            return;
        }
        setIsLoading(true);
        const data = {
            comparisonId,
            answers,
        };
        try {
            const reviewResource = await createResource('review');
            createResourceStatement(comparisonId, PREDICATES.REVIEW, reviewResource.id);
            createResourceData({ resourceId: reviewResource.id, data });
            setIsSubmitted(true);
        } catch (e) {
            toast.error('Something went wrong');
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Write review</ModalHeader>
            <ModalBody>
                {!comparisonId && (
                    <Alert color="danger" className="d-flex align-items-center">
                        You cannot write a review an unpublished comparison
                    </Alert>
                )}
                {comparisonCreator === userId && (
                    <Alert color="danger" className="d-flex align-items-center">
                        <div className="me-2">You cannot review your own comparison.</div>

                        <InviteResearchersButton comparisonId={comparisonId} />
                    </Alert>
                )}
                {comparisonId && !isSubmitted && (
                    <Table responsive className={comparisonCreator === userId ? 'text-muted' : ''}>
                        <thead>
                            <tr>
                                <th scope="col" />
                                <th scope="col" className="text-center" width="10%">
                                    Strongly disagree
                                </th>
                                <th scope="col" className="text-center" width="10%">
                                    Disagree
                                </th>
                                <th scope="col" className="text-center" width="10%">
                                    Neutral
                                </th>
                                <th scope="col" className="text-center" width="10%">
                                    Agree
                                </th>
                                <th scope="col" className="text-center" width="10%">
                                    Strongly agree
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewQuestions.map(({ id, question, input }) => (
                                <tr key={id}>
                                    <th scope="row" className="fw-normal">
                                        {question}
                                    </th>
                                    {input === 'likert' && (
                                        <>
                                            <td className="text-center">
                                                <Input
                                                    name={id}
                                                    type="radio"
                                                    value="-2"
                                                    disabled={comparisonCreator === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '-2'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id}
                                                    type="radio"
                                                    value="-1"
                                                    disabled={comparisonCreator === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '-1'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id}
                                                    type="radio"
                                                    value="0"
                                                    disabled={comparisonCreator === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '0'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id}
                                                    type="radio"
                                                    value="1"
                                                    disabled={comparisonCreator === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '1'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id}
                                                    type="radio"
                                                    value="2"
                                                    disabled={comparisonCreator === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '2'}
                                                />
                                            </td>
                                        </>
                                    )}
                                    {input === 'textarea' && (
                                        <td className="text-center" colSpan="5">
                                            <Input
                                                name={id}
                                                type="textarea"
                                                disabled={comparisonCreator === userId}
                                                onChange={handleChange}
                                                value={answers[id]}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {isSubmitted && <Alert color="success">The review has been saved successfully. Thank you for your review!</Alert>}
            </ModalBody>
            {comparisonId && !isSubmitted && (
                <ModalFooter className="d-flex">
                    <Button color="primary" onClick={handleSubmit} disabled={isLoading || comparisonCreator === userId}>
                        {!isLoading ? (
                            'Submit'
                        ) : (
                            <>
                                <Icon icon={faSpinner} spin /> Loading
                            </>
                        )}
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    );
};

WriteReview.propTypes = {
    comparisonId: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default WriteReview;
