import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';

import theme from '@/assets/scss/ThemeVariables';
import NewClassConfirmationModal from '@/components/ConfirmationModal/NewClassConfirmationModal';

const confirm = (props) =>
    new Promise((resolve) => {
        let container = document.createElement('div');
        const root = createRoot(container);
        const handleResolve = (result) => {
            root.unmount();
            container = null;
            resolve(result);
        };

        root.render(
            <ThemeProvider theme={theme}>
                <NewClassConfirmationModal {...props} onClose={handleResolve} />
            </ThemeProvider>,
        );
    });

export default confirm;
