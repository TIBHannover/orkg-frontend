import useTemplates from '@/app/grid-editor/hooks/useTemplates';

const useCanAddProperty = () => {
    const { templates } = useTemplates();

    let canAddProperty = true;

    if (templates.find((t) => t.is_closed)) {
        canAddProperty = false;
    }

    return { canAddProperty };
};

export default useCanAddProperty;
