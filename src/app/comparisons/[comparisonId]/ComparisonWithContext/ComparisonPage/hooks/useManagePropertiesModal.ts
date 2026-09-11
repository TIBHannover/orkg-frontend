import { parseAsBoolean, useQueryState } from 'nuqs';

const useManagePropertiesModal = () => {
    const [isOpen, setIsOpen] = useQueryState('manageProperties', parseAsBoolean.withDefault(false));

    return {
        isManagePropertiesOpen: isOpen,
        openManageProperties: () => setIsOpen(true),
        closeManageProperties: () => setIsOpen(false),
    };
};

export default useManagePropertiesModal;
