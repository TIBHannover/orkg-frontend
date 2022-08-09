import { createRoot } from 'react-dom/client';
import NewClassConfirmationModal from './NewClassConfirmationModal';

const confirm = props =>
    new Promise(resolve => {
        let container = document.createElement('div');
        const root = createRoot(container);
        const handleResolve = result => {
            root.unmount();
            container = null;
            resolve(result);
        };

        root.render(<NewClassConfirmationModal {...props} onClose={handleResolve} />);
    });

export default confirm;
