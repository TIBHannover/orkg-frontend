'use client';

import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';

import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';

type AiComparisonCreatorCtaBoxProps = {
    onOpen: () => void;
};

const AiComparisonCreatorCtaBox = ({ onOpen }: AiComparisonCreatorCtaBoxProps) => (
    <Alert status="accent" className="my-3">
        <Alert.Indicator>
            <FontAwesomeIcon icon={faLightbulb} size="lg" className="text-smart" />
        </Alert.Indicator>
        <Alert.Content>
            <Alert.Title>AI comparison creator</Alert.Title>
            <Alert.Description className="flex flex-col gap-2">
                Create a comparison quickly via the AI comparison creator. Provide a paper and let the AI automatically build a related work
                comparison for you. The only thing you have to do is review the content.
                <RequireAuthentication component={Button} className="button--orkg-smart" onClick={onOpen}>
                    AI comparison creator
                </RequireAuthentication>
            </Alert.Description>
        </Alert.Content>
    </Alert>
);

export default AiComparisonCreatorCtaBox;
