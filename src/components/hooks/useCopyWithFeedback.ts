import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

const COPIED_RESET_MS = 1500;

/**
 * Copy to clipboard with transient inline feedback: `isCopied` is true for a moment after each
 * copy so the trigger can swap its clipboard icon for a check.
 */
const useCopyWithFeedback = () => {
    const [, copyToClipboard] = useCopyToClipboard();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isCopied) return undefined;
        const timeout = setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
        return () => clearTimeout(timeout);
    }, [isCopied]);

    const copy = (value: string) => {
        copyToClipboard(value);
        setIsCopied(true);
    };

    return { isCopied, copy };
};

export default useCopyWithFeedback;
