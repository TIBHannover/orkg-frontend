import { faPen } from '@fortawesome/free-solid-svg-icons';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import { useEffect, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';

type DescriptionProps = {
    description: string | null;
    isEditable: boolean;
    handleUpdate: (description: string) => void;
};

const Description = ({ description, isEditable, handleUpdate }: DescriptionProps) => {
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [localDescription, setLocalDescription] = useState('');

    useEffect(() => {
        setLocalDescription(description || '');
    }, [description]);

    const handleStopEditingDescription = () => {
        setIsEditingDescription(false);
        handleUpdate(localDescription);
    };

    return (
        (isEditable || description) && (
            <p className="mb-0 mt-1 w-100 pt-0" style={{ lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                {!isEditingDescription ? (
                    <>
                        <small className="text-muted">{description || <em>No description</em>}</small>
                        {isEditable && (
                            <span className="ms-2">
                                <ActionButtonView
                                    // @ts-expect-error
                                    icon={faPen}
                                    action={() => setIsEditingDescription(true)}
                                    isDisabled={false}
                                    title="Edit"
                                />
                            </span>
                        )}
                    </>
                ) : (
                    <ReactTextareaAutosize
                        name="literalValue"
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={handleStopEditingDescription}
                        className="form-control form-control-sm"
                        autoFocus
                    />
                )}
            </p>
        )
    );
};

export default Description;
