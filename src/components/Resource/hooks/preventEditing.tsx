import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@heroui/react';
import { env } from 'next-runtime-env';

import Container from '@/components/Ui/Structure/Container';
import { CLASSES } from '@/constants/graphSettings';
import { Resource } from '@/services/backend/types';

export type PreventEditCase = {
    condition: (resource: Resource) => boolean;
    preventModalProps: (resource: Resource) => {
        header: string;
        content: React.ReactNode;
    };
    warningOnEdit?: React.ReactNode;
};

const PREVENT_EDIT_CASES: PreventEditCase[] = [
    {
        condition: (resource: Resource) => env('NEXT_PUBLIC_PWC_USER_ID') === resource.created_by,
        preventModalProps: (resource: Resource) => ({
            header: 'We are working on it!',
            content: (
                <>
                    This resource was imported from an external source and our provenance feature is in active development, and due to that, this
                    resource cannot be edited. <br />
                    Meanwhile, you can visit{' '}
                    <a
                        href={
                            resource.label ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${resource.label}` : 'https://paperswithcode.com/'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                    </a>{' '}
                    website to suggest changes.
                </>
            ),
        }),
    },
    {
        condition: (resource: Resource) => resource.classes.includes(CLASSES.RESEARCH_FIELD),
        preventModalProps: () => ({
            header: 'Research fields taxonomy!',
            content: (
                <>
                    This resource can not be edited. Please visit the{' '}
                    <a target="_blank" rel="noopener noreferrer" href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy">
                        ORKG help center
                    </a>{' '}
                    if you have any suggestions to improve the research fields taxonomy.
                </>
            ),
        }),
    },
    {
        condition: (resource: Resource) => resource.classes.includes(CLASSES.COMPARISON_PUBLISHED),
        warningOnEdit: (
            <Container className="mb-3">
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Editing a published resource</Alert.Title>
                        <Alert.Description>
                            This resource should not be edited because it is published. Please make sure you know what you are doing.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            </Container>
        ),
        preventModalProps: () => ({
            header: 'Editing not possible',
            content: <>This resource can not be edited because it is a published comparison.</>,
        }),
    },
];

const getPreventEditCase = (resource: Resource) => {
    for (const preventCase of PREVENT_EDIT_CASES) {
        const resultCondition = preventCase.condition(resource);
        if (resultCondition) {
            return preventCase;
        }
    }
    return undefined;
};

export default getPreventEditCase;
