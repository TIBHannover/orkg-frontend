import Tippy from '@tippyjs/react';
import { useState } from 'react';
import { Button, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createFeedback } from 'services/cms';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';

const Feedback = ({ type, inputData, outputData, llmTask }) => {
    const [comments, setComments] = useState('');
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const VALUES = {
        positive: {
            icon: '😀',
            options: ['This is helpful', 'This is correct', 'This reduces my workload'],
        },
        neutral: {
            icon: '😐',
            options: ['This is somewhat helpful', 'This is partially incorrect', 'This reduces my workload a bit'],
        },
        negative: {
            icon: '🙁',
            options: ['This is not helpful', 'This is incorrect', 'This does not reduce my workload', 'There is a bug'],
        },
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await createFeedback({
                llmTask,
                type,
                options: options.filter(o => VALUES[type].options.includes(o)).join(','),
                comments,
                inputData,
                outputData,
            });
            setIsSubmitted(true);
        } catch (e) {
            console.error(e);
            toast.error('An error occurred while saving your feedback');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Tippy
            interactive
            trigger="click"
            content={
                <div style={{ minWidth: 300, fontSize: '100%' }} className="p-2">
                    <h2 className="h6 text-white my-1">Provide feedback {VALUES[type].icon}</h2>
                    <hr />
                    {!isSubmitted ? (
                        <>
                            {VALUES[type].options.map(option => (
                                <div className="mb-1" key={option}>
                                    <Label check className="mb-0">
                                        <Input
                                            onChange={e =>
                                                options.includes(option)
                                                    ? setOptions(options.filter(o => o !== option))
                                                    : setOptions([...options, option])
                                            }
                                            checked={options.includes(option)}
                                            type="checkbox"
                                            className="me-2"
                                        />
                                        {option}
                                    </Label>
                                </div>
                            ))}
                            <Input
                                type="textarea"
                                placeholder="Optional: provide more feedback"
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                rows={4}
                                className="my-3"
                                style={{ fontSize: 'inherit' }}
                            />
                            <div className="d-flex justify-content-end">
                                <ButtonWithLoading color="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
                                    Submit
                                </ButtonWithLoading>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="d-flex align-items-center mb-1">
                                <Icon icon={faCheck} className="me-2" style={{ color: '#C1F8C0', fontSize: '160%' }} /> Successfully saved, thank you!
                            </p>
                        </>
                    )}
                </div>
            }
        >
            <span>
                <Button color="link" className="p-0 text-decoration-none ms-1" style={{ fontSize: '130%' }}>
                    {VALUES[type].icon}
                </Button>
            </span>
        </Tippy>
    );
};

Feedback.propTypes = {
    type: PropTypes.oneOf(['positive', 'neutral', 'negative']).isRequired,
    inputData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    outputData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    llmTask: PropTypes.string.isRequired,
};

export default Feedback;
