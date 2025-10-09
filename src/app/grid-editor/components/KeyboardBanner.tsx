import { useCookies } from 'next-client-cookies';

import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';

const KeyboardBanner = () => {
    const cookies = useCookies();
    const COOKIE_NAME = 'keyboardBannerDataGridDismissed';

    const onDismissKeyboardBanner = () => {
        cookies.set(COOKIE_NAME, 'true', { expires: 30 });
    };

    const isKeyboardBannerDismissed = cookies.get(COOKIE_NAME);

    return (
        <Container className=" tw:px-4 tw:my-2">
            <Alert color="info" isOpen={!isKeyboardBannerDismissed} toggle={onDismissKeyboardBanner}>
                You can use keyboard shortcuts to navigate the grid, copy/paste values, and delete values (Delete key).
            </Alert>
        </Container>
    );
};

export default KeyboardBanner;
