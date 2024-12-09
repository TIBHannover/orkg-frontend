import useComparison from 'components/Comparison/hooks/useComparison';
import { PREDICATES } from 'constants/graphSettings';
import useParams from 'components/useParams/useParams';
import { deleteStatementById, getStatements } from 'services/backend/statements';
import { Statement } from 'services/backend/types';
import { getVisualization, visualizationsUrl } from 'services/backend/visualizations';
import useSWR from 'swr';

const useVisualizations = () => {
    const { comparisonId } = useParams<{ comparisonId: string }>();
    const { comparison, mutate } = useComparison();

    const { data: visualizations, isLoading: isLoadingVisualizations } = useSWR(
        comparison?.visualizations && comparison?.visualizations.length > 0
            ? [comparison?.visualizations.map(({ id: _id }) => _id), visualizationsUrl, 'getVisualization']
            : null,
        ([ids]) => {
            return Promise.all(ids.map((id) => getVisualization(id)));
        },
    );

    const unlinkVisualization = async (id: string) => {
        const statements = (await getStatements({
            subjectId: comparisonId,
            predicateId: PREDICATES.HAS_VISUALIZATION,
            objectId: id,
        })) as Statement[];
        await deleteStatementById(statements?.[0]?.id);
        mutate();
    };

    return {
        visualizations,
        isLoadingVisualizations,
        unlinkVisualization,
    };
};

export default useVisualizations;
