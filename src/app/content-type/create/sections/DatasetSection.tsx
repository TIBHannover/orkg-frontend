'use client';

import Link from 'next/link';
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

type DatasetSectionProps = {
    classId: string;
};

const DatasetSection = ({ classId }: DatasetSectionProps) => {
    const [title, setTitle] = useState('');
    const { handleCreate, isLoading, resourceId } = useCreateContentType(classId);

    return (
        <ContentTypeSectionWrapper
            title="Datasets"
            description={
                <>
                    ORKG Datasets provide structured metadata descriptions for datasets. Datasets can be published with a DOI, which persists the
                    state of the dataset and makes them suitable for reuse in research. This structured approach ensures better discoverability and
                    citation tracking.
                </>
            }
            helpfulResourcesSubtitle="Example datasets within the ORKG"
            helpfulResourcesExamples={
                <ul className="tw:py-2 tw:!m-0">
                    <li>
                        <Link href="https://orkg.org/content-type/Dataset/R75321" target="_blank">
                            SemEval-2021 Task 11
                        </Link>
                    </li>
                    <li>
                        <Link href="https://orkg.org/content-type/Dataset/R1568117" target="_blank">
                            SCITAB
                        </Link>
                    </li>
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

export default DatasetSection;
