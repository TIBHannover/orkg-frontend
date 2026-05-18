import { Alert, CloseButton, Kbd } from '@heroui/react';
import { useCookies } from 'next-client-cookies';

import Container from '@/components/Ui/Structure/Container';

const COOKIE_NAME = 'keyboardBannerDataGridDismissed';

const KeyboardBanner = () => {
    const cookies = useCookies();

    const onDismissKeyboardBanner = () => {
        cookies.set(COOKIE_NAME, 'true', { expires: 30 });
    };

    if (cookies.get(COOKIE_NAME)) {
        return null;
    }

    return (
        <Container className="my-2">
            <Alert status="accent" className="shadow">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Keyboard shortcuts available</Alert.Title>
                    <Alert.Description>
                        Use{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="up" />
                        </Kbd>{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="down" />
                        </Kbd>{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="left" />
                        </Kbd>{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="right" />
                        </Kbd>{' '}
                        to navigate,{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="ctrl" />
                            <Kbd.Content>C</Kbd.Content>
                        </Kbd>{' '}
                        /{' '}
                        <Kbd>
                            <Kbd.Abbr keyValue="ctrl" />
                            <Kbd.Content>V</Kbd.Content>
                        </Kbd>{' '}
                        to copy/paste, and{' '}
                        <Kbd>
                            <Kbd.Content>Delete</Kbd.Content>
                        </Kbd>{' '}
                        to clear values.
                    </Alert.Description>
                </Alert.Content>
                <CloseButton aria-label="Dismiss keyboard shortcuts banner" onPress={onDismissKeyboardBanner} />
            </Alert>
        </Container>
    );
};

export default KeyboardBanner;
