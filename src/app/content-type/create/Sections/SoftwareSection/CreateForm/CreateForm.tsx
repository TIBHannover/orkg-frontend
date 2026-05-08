import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import useCreateContentType from '@/app/content-type/create/hooks/useCreateContentType';
import Tooltip from '@/components/FloatingUI/Tooltip';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type CreateFormProps = {
    classId: string;
};

const CreateForm: FC<CreateFormProps> = ({ classId }) => {
    const { handleCreate, isLoading, resourceId } = useCreateContentType(classId);
    const [title, setTitle] = useState('');

    return (
        <Form onSubmit={(e) => handleCreate(e, title)}>
            <FormGroup>
                <Tooltip content="Choose the title of your software. You can always update the title later.">
                    <span>
                        <Label for="softwareTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                    </span>
                </Tooltip>
                <InputGroup>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        maxLength={MAX_LENGTH_INPUT}
                        name="value"
                        id="softwareTitle"
                        disabled={isLoading}
                        required
                    />
                    {!resourceId && (
                        <RequireAuthentication component={Button} type="submit" color="primary">
                            Create
                        </RequireAuthentication>
                    )}
                </InputGroup>
            </FormGroup>
        </Form>
    );
};

export default CreateForm;
