import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import useComparison from 'components/Comparison/hooks/useComparison';
import feedbackQuestions from 'components/Comparison/QualityReportModal/hooks/feedbackQuestions';
import InviteResearchersButton from 'components/Comparison/QualityReportModal/InviteResearchersButton/InviteResearchersButton';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import THING_TYPES from 'constants/thingTypes';
import { ChangeEvent, FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Input, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { createResourceStatement } from 'services/backend/statements';
import { createThing } from 'services/simcomp';
import { RootStore } from 'slices/types';

type WriteFeedbackModalProps = {
    toggle: () => void;
};

const WriteFeedbackModal: FC<WriteFeedbackModalProps> = ({ toggle }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { comparison, isPublished } = useComparison();
    const user = useSelector((state: RootStore) => state.auth.user);
    const userId = user ? user.id : null;

    if (!comparison) {
        return null;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAnswers({
            ...answers,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < feedbackQuestions.length) {
            toast.error('Please answer all questions');
            return;
        }
        setIsLoading(true);
        const data = {
            comparisonId: comparison.id,
            answers,
        };
        try {
            const feedbackResource = await createResource('feedback', [CLASSES.QUALITY_FEEDBACK]);
            createResourceStatement(comparison.id, PREDICATES.QUALITY_FEEDBACK, feedbackResource.id);
            // @ts-expect-error awaiting migration simcomp
            createThing({ thingType: THING_TYPES.QUALITY_REVIEW, thingKey: feedbackResource.id, data });
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
            <ModalHeader toggle={toggle}>Write feedback</ModalHeader>
            <ModalBody>
                {!isPublished && (
                    <Alert color="danger" className="d-flex align-items-center">
                        You cannot provide feedback for an unpublished comparison
                    </Alert>
                )}
                {isPublished && comparison.created_by === userId && (
                    <Alert color="danger" className="d-flex align-items-center">
                        <div className="me-2">You cannot provide feedback for your own comparison.</div>

                        <InviteResearchersButton comparisonId={comparison.id} />
                    </Alert>
                )}
                {isPublished && !isSubmitted && (
                    <Table responsive className={comparison.created_by === userId ? 'text-muted' : ''}>
                        <thead>
                            <tr>
                                <th scope="col" />
                                <th scope="col" className="text-center" style={{ width: '10%' }}>
                                    Strongly disagree
                                </th>
                                <th scope="col" className="text-center" style={{ width: '10%' }}>
                                    Disagree
                                </th>
                                <th scope="col" className="text-center" style={{ width: '10%' }}>
                                    Neutral
                                </th>
                                <th scope="col" className="text-center" style={{ width: '10%' }}>
                                    Agree
                                </th>
                                <th scope="col" className="text-center" style={{ width: '10%' }}>
                                    Strongly agree
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackQuestions.map(({ id, question, input }) => (
                                <tr key={id}>
                                    <th scope="row" className="fw-normal">
                                        {question}
                                    </th>
                                    {input === 'likert' && (
                                        <>
                                            <td className="text-center">
                                                <Input
                                                    name={id.toString()}
                                                    type="radio"
                                                    value="-2"
                                                    disabled={comparison.created_by === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '-2'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id.toString()}
                                                    type="radio"
                                                    value="-1"
                                                    disabled={comparison.created_by === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '-1'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id.toString()}
                                                    type="radio"
                                                    value="0"
                                                    disabled={comparison.created_by === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '0'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id.toString()}
                                                    type="radio"
                                                    value="1"
                                                    disabled={comparison.created_by === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '1'}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Input
                                                    name={id.toString()}
                                                    type="radio"
                                                    value="2"
                                                    disabled={comparison.created_by === userId}
                                                    onChange={handleChange}
                                                    checked={answers[id] === '2'}
                                                />
                                            </td>
                                        </>
                                    )}
                                    {input === 'textarea' && (
                                        <td className="text-center" colSpan={5}>
                                            <Input
                                                name={id.toString()}
                                                type="textarea"
                                                disabled={comparison.created_by === userId}
                                                onChange={handleChange}
                                                value={answers[id]}
                                                maxLength={MAX_LENGTH_INPUT}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {isSubmitted && <Alert color="success">The feedback has been saved successfully. Thank you for your feedback!</Alert>}
            </ModalBody>
            {isPublished && !isSubmitted && (
                <ModalFooter className="d-flex">
                    <ButtonWithLoading
                        color="primary"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={isLoading || comparison.created_by === userId}
                    >
                        Submit
                    </ButtonWithLoading>
                </ModalFooter>
            )}
        </Modal>
    );
};

export default WriteFeedbackModal;
