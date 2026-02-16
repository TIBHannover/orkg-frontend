import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, FormEvent, useId, useState } from 'react';
import { toast } from 'react-toastify';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { createComparison } from '@/services/backend/comparisons';

type CreateComparisonModalProps = {
    toggle: () => void;
    contributionIds: string[];
};

const CreateComparisonModal: FC<CreateComparisonModalProps> = ({ toggle, contributionIds }) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [createdComparisonId, setCreatedComparisonId] = useState<string | null>(null);
    const formId = useId();

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsLoading(true);
        try {
            const comparisonId = await createComparison({
                title,
                description: '',
                research_fields: [],
                authors: [],
                contributions: contributionIds,
                data: {
                    contributions: [],
                    predicates: [],
                    data: {},
                },
                references: [],
                observatories: [],
                organizations: [],
                config: {
                    contributions: contributionIds,
                    predicates: [],
                    transpose: false,
                    type: 'PATH',
                },
                is_anonymized: false,
            });
            setCreatedComparisonId(comparisonId);
        } catch (error) {
            errorHandler({ error, shouldShowToast: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalWithLoading isLoading={isLoading} isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Create comparison</ModalHeader>
            <Form onSubmit={handleCreate}>
                <ModalBody>
                    {!createdComparisonId ? (
                        <FormGroup>
                            <Tooltip content="Choose the title of your comparison. You can always update the title later">
                                <span>
                                    <Label for={`${formId}label`}>Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                                </span>
                            </Tooltip>
                            <Input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={MAX_LENGTH_INPUT}
                                id={`${formId}label`}
                            />
                        </FormGroup>
                    ) : (
                        <Alert color="success">
                            Comparison created successfully.{' '}
                            <Link href={reverse(ROUTES.COMPARISON, { comparisonId: createdComparisonId })}>Visit your comparison.</Link>
                        </Alert>
                    )}
                </ModalBody>
                {!createdComparisonId && (
                    <ModalFooter>
                        <Button type="submit" color="primary">
                            Create
                        </Button>
                    </ModalFooter>
                )}
            </Form>
        </ModalWithLoading>
    );
};

export default CreateComparisonModal;
