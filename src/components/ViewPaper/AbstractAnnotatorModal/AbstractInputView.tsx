import { ClipboardEvent, FC } from 'react';
import { useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { Alert } from 'reactstrap';

import FormFeedback from '@/components/Ui/Form/FormFeedback';
import Label from '@/components/Ui/Label/Label';
import Tooltip from '@/components/Utils/Tooltip';
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
        <div>
            {!isAbstractLoading && isAbstractFailedFetching && (
                <Alert color="light">We couldn't fetch the abstract of the paper, please enter it manually.</Alert>
            )}
            <Alert color="info">
                The provided abstract is not stored and is only used for processing. So you do not have to worry about potential copyright issues
            </Alert>
            <Label for="paperAbstract">
                <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper.">Enter the paper abstract</Tooltip>
            </Label>
            <Textarea
                id="paperAbstract"
                className={`form-control ps-2 pe-2 ${!validation ? 'is-invalid' : ''}`}
                minRows={8}
                value={abstract}
                onChange={(event) => setAbstract(event.target.value)}
                onPaste={stripLineBreaks}
            />
            {!validation && <FormFeedback className="order-1">Please enter the abstract.</FormFeedback>}
        </div>
    );
};

export default AbstractInputView;
