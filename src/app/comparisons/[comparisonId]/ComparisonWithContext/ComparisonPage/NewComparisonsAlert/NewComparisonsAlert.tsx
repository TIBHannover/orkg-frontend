import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, CloseButton } from '@heroui/react';
import { useCookies } from 'next-client-cookies';
import { AnchorHTMLAttributes } from 'react';

import Container from '@/components/Ui/Structure/Container';

const COOKIE_NAME = 'isNewComparisonAlertDismissed';

const NewComparisonsAlert = () => {
    const cookies = useCookies();

    if (cookies.get(COOKIE_NAME)) {
        return null;
    }

    const onDismiss = () => {
        cookies.set(COOKIE_NAME, 'true', { expires: 30 });
    };

    return (
        <Container className="mb-4">
            <Alert status="accent" className="shadow-sm">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Comparison update</Alert.Title>
                    <Alert.Description>
                        ORKG Comparisons have changed. We have added new features and improved the user interface. Comparisons might look slightly
                        different, but the comparison data itself remains unchanged.
                    </Alert.Description>
                </Alert.Content>
                <Button
                    size="sm"
                    variant="primary"
                    aria-label="Read more about the comparison update"
                    render={(props) => (
                        <a
                            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                            href="https://orkg.org/page/comparison-update"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    )}
                >
                    Read more <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-1" />
                </Button>
                <CloseButton aria-label="Dismiss update notice" onPress={onDismiss} />
            </Alert>
        </Container>
    );
};

export default NewComparisonsAlert;
