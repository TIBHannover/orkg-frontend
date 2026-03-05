'use client';

import { useState } from 'react';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import useCreateContentType from '@/app/content-type/create/hooks/useCreateContentType';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type SoftwareSectionProps = {
    classId: string;
};

const SoftwareSection = ({ classId }: SoftwareSectionProps) => {
    const [title, setTitle] = useState('');
    const { handleCreate, isLoading, resourceId } = useCreateContentType(classId);

    return (
        <ContentTypeSectionWrapper
            title="Software"
            description={
                <>
                    ORKG Software provides structured metadata descriptions for software. This includes capturing version information, dependencies,
                    and technical specifications, enabling better reproducibility and citation practices.
                </>
            }
            helpfulResourcesSubtitle="Example software within the ORKG"
            helpfulResourcesExamples={
                <ul className="tw:py-2 tw:!m-0">
                    <li className="tw:italic">Examples coming soon</li>
                </ul>
            }
        >
            <Form onSubmit={(e) => handleCreate(e, title)}>
                <FormGroup>
                    <Label for="title">Title</Label>
                    <InputGroup>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            maxLength={MAX_LENGTH_INPUT}
                            name="value"
                            id="title"
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
        </ContentTypeSectionWrapper>
    );
};

export default SoftwareSection;
