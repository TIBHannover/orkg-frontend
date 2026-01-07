import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';

import theme from '@/assets/scss/ThemeVariables';
import NewClassConfirmationModal from '@/components/ConfirmationModal/NewClassConfirmationModal';

const confirm = (props) =>
    new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const handleResolve = (result) => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            resolve(result);
        };

        root.render(
            <ThemeProvider theme={theme}>
                <NewClassConfirmationModal {...props} onClose={handleResolve} />
            </ThemeProvider>,
        );
    });

export default confirm;
