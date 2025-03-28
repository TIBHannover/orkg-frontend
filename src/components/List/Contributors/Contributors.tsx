import ContributorsComponent from '@/components/Contributors/Contributors';
import useList from '@/components/List/hooks/useList';

const Contributors = () => {
    const { list } = useList();

    if (!list) {
        return null;
    }

    const contributors = Object.entries(list.acknowledgements).map(([id, amount]) => ({ id, percentage: Math.floor(amount * 100) }));

    return <ContributorsComponent contributors={contributors} />;
};

export default Contributors;
