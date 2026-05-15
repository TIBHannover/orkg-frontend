import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Alert from '@/components/Ui/Alert/Alert';

const NotFound = () => (
    <Alert color="danger" className="mb-0 rounded flex">
        <FontAwesomeIcon icon={faExclamation} className="text-accent my-6 mx-6 text-2xl" />
        <div>
            The entity you are looking for was not found.
            <br />
            <small>
                We failed to load the requested entity. Possibly the resource was deleted by another user in between publishing the comparison and
                now.
            </small>
            <br />
        </div>
    </Alert>
);

export default NotFound;
