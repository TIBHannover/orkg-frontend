import { useEffect, useState } from 'react';

type UseBaseClassParams = {
    baseClass?: string;
    onEffectiveBaseClassChange?: (effectiveBaseClass: string | undefined) => void;
};

const useBaseClass = ({ baseClass, onEffectiveBaseClassChange }: UseBaseClassParams) => {
    const [effectiveBaseClass, setEffectiveBaseClass] = useState(baseClass);

    // Sync effectiveBaseClass with baseClass prop changes
    useEffect(() => {
        setEffectiveBaseClass(baseClass);
    }, [baseClass]);

    // Notify parent component whenever effectiveBaseClass changes
    useEffect(() => {
        onEffectiveBaseClassChange?.(effectiveBaseClass);
    }, [effectiveBaseClass, onEffectiveBaseClassChange]);

    const handleBaseClassChange = (value: string | null) => {
        setEffectiveBaseClass(value ?? undefined);
    };

    return {
        effectiveBaseClass,
        handleBaseClassChange,
        rootBaseClass: baseClass,
    };
};

export default useBaseClass;
