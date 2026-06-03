import useSWR from 'swr';

import { PREDICATES } from '@/constants/graphSettings';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { getStatements, statementsUrl } from '@/services/backend/statements';

type UseBenchmarkDatasetResourceParams = {
    datasetId: string;
    problemId: string;
};

const useBenchmarkDatasetResource = ({ datasetId, problemId }: UseBenchmarkDatasetResourceParams) => {
    const {
        data: datasetResource,
        error: datasetError,
        isLoading: isLoadingDataset,
        mutate: mutateDataset,
    } = useSWR(datasetId ? [datasetId, resourcesUrl, 'getDatasetResource'] : null, ([id]) => getResource(id));

    const {
        data: descriptionStatements,
        error: descriptionError,
        isLoading: isLoadingDescription,
    } = useSWR(
        datasetId ? [{ subjectId: datasetId, predicateId: PREDICATES.DESCRIPTION, size: 1 }, statementsUrl, 'getDatasetDescription'] : null,
        ([params]) => getStatements(params),
    );

    const {
        data: problemResource,
        error: problemError,
        isLoading: isLoadingProblem,
    } = useSWR(problemId ? [problemId, resourcesUrl, 'getProblemResource'] : null, ([id]) => getResource(id));

    const datasetDescription = descriptionStatements?.[0]?.object?.label;

    const isLoading = isLoadingDataset || isLoadingDescription || isLoadingProblem;
    const isFailedLoading = !!datasetError || !!descriptionError || !!problemError;

    return {
        datasetResource,
        problemResource,
        datasetDescription,
        isLoading,
        isFailedLoading,
        loadResourceData: mutateDataset,
    };
};

export default useBenchmarkDatasetResource;
