import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';

type DescriptionProps = {
    description: string | null;
    isEditable: boolean;
    handleUpdate: (description: string) => void;
};

const Description = ({ description, isEditable, handleUpdate }: DescriptionProps) => {
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [localDescription, setLocalDescription] = useState('');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalDescription(description || '');
    }, [description]);

    const handleStopEditingDescription = () => {
        setIsEditingDescription(false);
        handleUpdate(localDescription);
    };

    return (
        (isEditable || description) && (
            <p className="mb-0 mt-1 min-h-[28px] w-full whitespace-pre-line pt-0 leading-[1.2]">
                {!isEditingDescription ? (
                    <>
                        <small className="text-muted">{description || <em>No description</em>}</small>
                        {isEditable && (
                            <span className="ml-2">
                                <ActionButtonView icon={faPen} action={() => setIsEditingDescription(true)} isDisabled={false} title="Edit" />
                            </span>
                        )}
                    </>
                ) : (
                    <ReactTextareaAutosize
                        name="literalValue"
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={handleStopEditingDescription}
                        className="w-full rounded-md border border-default bg-field-background px-2 py-1 text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-2 focus:outline-focus"
                        autoFocus
                    />
                )}
            </p>
        )
    );
};

export default Description;
