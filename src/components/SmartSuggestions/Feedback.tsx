import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Separator, TextArea, toast } from '@heroui/react';
import { FC, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Popover from '@/components/FloatingUI/Popover';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createFeedback } from '@/services/cms';
import { FeedbackType } from '@/services/cms/types';

type FeedbackProps = {
    type: FeedbackType;
    inputData: object;
    outputData: object;
    llmTask: string;
};

type FeedbackVariants = Record<FeedbackType, { icon: string; options: string[] }>;

const VALUES: FeedbackVariants = {
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

const Feedback: FC<FeedbackProps> = ({ type, inputData, outputData, llmTask }) => {
    const [comments, setComments] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const toggleOption = (option: string) => {
        setOptions((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await createFeedback({
                llmTask,
                type,
                options: options.filter((o) => VALUES[type].options.includes(o)).join(','),
                comments,
                inputData,
                outputData,
            });
            setIsSubmitted(true);
        } catch (e) {
            console.error(e);
            toast.danger('An error occurred while saving your feedback');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover
            content={
                <div style={{ minWidth: 300, fontSize: '100%' }} className="p-2">
                    <div className="font-semibold my-1">Provide feedback {VALUES[type].icon}</div>
                    <Separator className="my-3" />
                    {!isSubmitted ? (
                        <>
                            {VALUES[type].options.map((option) => (
                                <div className="mb-1" key={option}>
                                    <Checkbox isSelected={options.includes(option)} onChange={() => toggleOption(option)}>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>{option}</Checkbox.Content>
                                    </Checkbox>
                                </div>
                            ))}
                            <TextArea
                                fullWidth
                                placeholder="Optional: provide more feedback"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={4}
                                className="my-4"
                                style={{ fontSize: 'inherit' }}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                            <div className="flex justify-end">
                                <ButtonWithLoading variant="primary" size="sm" onPress={handleSubmit} isLoading={isLoading}>
                                    Submit
                                </ButtonWithLoading>
                            </div>
                        </>
                    ) : (
                        <p className="flex items-center mb-1">
                            <FontAwesomeIcon icon={faCheck} className="mr-2" style={{ color: '#C1F8C0', fontSize: '160%' }} /> Successfully saved,
                            thank you!
                        </p>
                    )}
                </div>
            }
        >
            <Button
                isIconOnly
                variant="ghost"
                aria-label={`Leave ${type} feedback`}
                className="!p-0 !min-w-0 !h-auto ml-1 border-0 bg-transparent hover:bg-white/10"
                style={{ fontSize: '130%' }}
            >
                {VALUES[type].icon}
            </Button>
        </Popover>
    );
};

export default Feedback;
