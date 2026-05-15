import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Tooltip } from '@heroui/react';
import { ClipboardEvent, FC } from 'react';
import { useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import { RootStore } from '@/slices/types';

type AbstractInputViewProps = {
    validation: boolean;
    abstract: string;
    setAbstract: (abstract: string) => void;
};

const AbstractInputView: FC<AbstractInputViewProps> = ({ validation, abstract, setAbstract }) => {
    const isAbstractFailedFetching = useSelector((state: RootStore) => state.viewPaper.isAbstractFailedFetching);
    const isAbstractLoading = useSelector((state: RootStore) => state.viewPaper.isAbstractLoading);

    const stripLineBreaks = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain').replace(/\r?\n|\r/g, ' ');
        setAbstract(abstract + text);
    };

    return (
        <div className="flex flex-col gap-3">
            {!isAbstractLoading && isAbstractFailedFetching && (
                <Alert status="default">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Abstract not available</Alert.Title>
                        <Alert.Description>We couldn't fetch the abstract of the paper, please enter it manually.</Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <Alert status="accent">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Abstract is not stored</Alert.Title>
                    <Alert.Description>
                        The provided abstract is not stored and is only used for processing. So you do not have to worry about potential copyright
                        issues.
                    </Alert.Description>
                </Alert.Content>
            </Alert>
            <div className="flex flex-col gap-1">
                <label htmlFor="paperAbstract" className="text-sm font-medium inline-flex items-center gap-1">
                    Enter the paper abstract
                    <Tooltip delay={0}>
                        <Tooltip.Trigger>
                            <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help" />
                        </Tooltip.Trigger>
                        <Tooltip.Content showArrow>
                            <Tooltip.Arrow />
                            Enter the paper abstract to get automatically generated concepts for your paper.
                        </Tooltip.Content>
                    </Tooltip>
                </label>
                <Textarea
                    id="paperAbstract"
                    className={`w-full px-3 py-2 rounded-md border bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus/40 ${
                        !validation ? 'border-danger' : 'border-border'
                    }`}
                    minRows={8}
                    value={abstract}
                    onChange={(event) => setAbstract(event.target.value)}
                    onPaste={stripLineBreaks}
                />
                {!validation && <small className="text-danger">Please enter the abstract.</small>}
            </div>
        </div>
    );
};

export default AbstractInputView;
