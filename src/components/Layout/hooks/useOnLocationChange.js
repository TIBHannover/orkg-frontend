import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Listen for changes to the location and run the callback when the location changes.
 *
 * @param {function} handleLocationChange
 */
const useOnLocationChange = handleLocationChange => {
    const location = useLocation();

    useEffect(() => {
        handleLocationChange(location);
    }, [location, handleLocationChange]);
};

export default useOnLocationChange;
