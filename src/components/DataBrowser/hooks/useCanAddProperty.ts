import useTemplates from '@/components/DataBrowser/hooks/useTemplates';

const useCanAddProperty = () => {
    const { templates } = useTemplates();

    let canAddProperty = true;

    if (templates.find((t) => t.isClosed)) {
        canAddProperty = false;
    }

    return { canAddProperty };
};

export default useCanAddProperty;
