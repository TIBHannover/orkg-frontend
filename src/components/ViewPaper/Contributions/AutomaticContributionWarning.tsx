import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';
import { FC } from 'react';

type Contribution = {
    id: string;
};

type AutomaticContributionWarningProps = {
    contribution: Contribution;
    onVerifyHandler: (id: string) => void;
    enableEdit: boolean;
};

const AutomaticContributionWarning: FC<AutomaticContributionWarningProps> = ({ contribution, onVerifyHandler, enableEdit }) => (
    <Alert status="accent" className="mb-4">
        <Alert.Indicator />
        <Alert.Content>
            <Alert.Title>Automatically extracted contribution</Alert.Title>
            <Alert.Description className="flex flex-wrap items-center justify-between gap-3">
                <span>The information of this contribution has been automatically extracted.</span>
                {enableEdit && (
                    <Button className="button--orkg-smart shrink-0" size="sm" onPress={() => onVerifyHandler(contribution.id)}>
                        <FontAwesomeIcon icon={faCheck} className="mr-1" /> Verify
                    </Button>
                )}
            </Alert.Description>
        </Alert.Content>
    </Alert>
);

export default AutomaticContributionWarning;
