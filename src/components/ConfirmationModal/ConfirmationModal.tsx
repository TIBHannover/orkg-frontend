import { createRoot } from 'react-dom/client';

import NewClassConfirmationModal from '@/components/ConfirmationModal/NewClassConfirmationModal';
import { Class } from '@/services/backend/types';

type ConfirmClassProps = {
    label: string;
    uri?: string;
    showParentField?: boolean;
};

const confirm = (props: ConfirmClassProps): Promise<Class | false> =>
    new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const handleResolve = (result: Class | false) => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            resolve(result);
        };

        root.render(<NewClassConfirmationModal {...props} onClose={handleResolve} />);
    });

export default confirm;
