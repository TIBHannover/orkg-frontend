import { Alert } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
    return (
        <Alert color="danger" className="mb-0 rounded d-flex">
            <Icon icon={faExclamation} className="text-primary my-4 mx-4" style={{ fontSize: 25 }} />
            <div>
                The entity you are looking for was not found.
                <br />
                <span style={{ fontSize: '0.875rem' }}>
                    We failed to load the requested entity. Possibly the resource was deleted by another user in between publishing the comparison and
                    now.
                </span>
                <br />
            </div>
        </Alert>
    );
};

export default NotFound;
