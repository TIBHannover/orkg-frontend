import { useEffect } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

/**
 * Listen for changes to the location and run the callback when the location changes.
 *
 * @param {function} handleLocationChange
 */
const useOnLocationChange = handleLocationChange => {
    const location = useLocation();

    useEffect(() => handleLocationChange(location), [location, handleLocationChange]);
};

export default useOnLocationChange;
