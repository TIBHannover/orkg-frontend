import { render, unmountComponentAtNode } from 'react-dom';
import NewClassConfirmationModal from './NewClassConfirmationModal';

const confirm = props =>
    new Promise(resolve => {
        let el = document.createElement('div');

        const handleResolve = result => {
            unmountComponentAtNode(el);
            el = null;
            resolve(result);
        };

        render(<NewClassConfirmationModal {...props} onClose={handleResolve} />, el);
    });

export default confirm;
