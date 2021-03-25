//This code is adapted after useResearchProblemResearchFields.js
import { useState, useEffect, useCallback } from 'react';
//backend service | Benchmarks Section in the Research Problems Page https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263
//import { getBenchmarksByResearchFieldId } from 'services/backend/researchFields';
//import { getResearchFieldsWithBenchmarks } from 'services/backend/benchmarks';
//in the original program there is useParams call - what does that do?
import { useParams } from 'react-router-dom';

function useBenchmarks() {
    const pageSize = 16;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [benchmarks, setBenchmarks] = useState([]);

    const loadBenchmarks = useCallback(page => {
        setIsLoading(true);

        const results = [
            {
                id: 'R9143',
                name: 'Question Answering',
                numDatasets: 10,
                numPapers: 20,
                numCode: 11,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R69806',
                name: 'Named Entity Recognition',
                numDatasets: 5,
                numPapers: 10,
                numCode: 9,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R9145',
                name: 'Semantic Question Answering',
                numDatasets: 1,
                numPapers: 2,
                numCode: 0,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R2039',
                name: 'Collaborative question answering',
                numDatasets: 1,
                numPapers: 1,
                numCode: 1,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R44249',
                name: 'Named Entity Recognition and Classification',
                numDatasets: 14,
                numPapers: 50,
                numCode: 29,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R49505',
                name: 'Document classification',
                numDatasets: 24,
                numPapers: 140,
                numCode: 57,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R34275',
                name: 'Machine translation',
                numDatasets: 30,
                numPapers: 250,
                numCode: 140,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R38192',
                name: 'End-to-end relation extraction',
                numDatasets: 10,
                numPapers: 30,
                numCode: 11,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R44342',
                name: 'Relation extraction',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R49506',
                name: 'Document classification',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R38193',
                name: 'Joint entity and relation extraction',
                numDatasets: 1,
                numPapers: 1,
                numCode: 0,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R44284',
                name: 'Named entity recognition and relation classification',
                numDatasets: 3,
                numPapers: 14,
                numCode: 5,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid1',
                name: 'Task 3',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid2',
                name: 'Task 4',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid3',
                name: 'Task 5',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid4',
                name: 'Task 6',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid5',
                name: 'Task 7',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'DummyTaskid6',
                name: 'Task 1',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid7',
                name: 'Task 2',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid8',
                name: 'Task 8',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid9',
                name: 'Task 9',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid10',
                name: 'Task 10',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid11',
                name: 'Task 11',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'DummyTaskid12',
                name: 'Task 12',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            }
        ];
        setBenchmarks(prevResources => [...prevResources, ...results]);
        setIsLoading(false);
        setHasNextPage(results.length < pageSize || results.length === 0 ? false : true);
        setIsLastPageReached(false);
        setPage(page + 1);
    }, []);

    useEffect(() => {
        loadBenchmarks(1);
    }, [loadBenchmarks]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadBenchmarks(page);
        }
    };

    return [benchmarks, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useBenchmarks;
