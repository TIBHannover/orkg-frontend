//This code is adapted after useResearchProblemResearchFields.js
import { useState, useEffect, useCallback } from 'react';
//backend service | Benchmarks Section in the Research Problems Page https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263
//import { getDatasetBenchmarksByResearchProblemId } from 'services/backend/datasets';
//import { getResearchFieldsByResearchProblemId } from 'services/backend/problems';
//import { getResearchDatasetsByResearchProblemId } from 'services/backend/problems';
//in the original program there is useParams call - what does that do?
import { useParams } from 'react-router-dom';

function useResearchProblemBenchmarks() {
    const [researchProblemBenchmarksData, setResearchProblemBenchmarks] = useState([]);
    const { researchProblemId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(false);
    //const [isLoadingData, setIsLoadingData] = useState(false);
    //const [isFailedLoadingData, setIsFailedLoading] = useState(false);
    //note in the constant below, isLoading is not being reset

    //adapt the Home/hooks/useObservatories.js

    const loadResearchProblemBenchmarks = useCallback(rpId => {
        if (rpId) {
            const result = [
                {
                    id: 'R70896',
                    name: 'SQuAD2.0',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 2',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 3',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 4',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 5',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 6',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                },
                {
                    id: 'R9143',
                    name: 'SQUAD 7',
                    numModels: 5,
                    numPapers: 8,
                    numCode: 2
                }
            ];
            setResearchProblemBenchmarks(result);
            setIsLoadingData(false);
        }
    }, []);

    {
        /*
        Uncomment after the backend service is implemented
    loadResearchProblemBenchmarks = () => {
        setIsLoadingData(true);
        //rpId
        getDatasetBenchmarksByResearchProblemId(rpId)
            .then(async data => {
                setResearchProblemBenchmarks(data);
                setIsLoadingData(false);
                setIsFailedLoading(false);
            })
            .catch(e => {
                setIsLoadingData(false);
                setIsFailedLoading(true);
            });
        };
    */
    }

    useEffect(() => {
        if (researchProblemId !== undefined) {
            loadResearchProblemBenchmarks(researchProblemId);
        }
    }, [researchProblemId, loadResearchProblemBenchmarks]);
    return [researchProblemBenchmarksData, isLoadingData];
    //return {researchProblemBenchmarksData, isLoadingData, isFailedLoadingData};
}
export default useResearchProblemBenchmarks;
