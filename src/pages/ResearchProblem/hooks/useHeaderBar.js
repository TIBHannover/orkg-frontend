import { useState } from 'react';

function useHeaderBar(initialVal = false) {
    const [state, setState] = useState(initialVal);

    const handleChange = isVisible => {
        setState(!isVisible);
    };

    return [state, handleChange];
}
export default useHeaderBar;
