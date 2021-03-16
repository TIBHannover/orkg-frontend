import { useState, useEffect, useCallback } from 'react';
//# Summary for a dataset:
//curl --silent http://localhost:8080/api/datasets/DS1/summary | jq .
//described in https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263
import { useParams } from 'react-router-dom';
//import { getDatasetBenchmarksByDatasetResourceId } from 'services/backend/datasets';
//import { CLASSES } from 'constants/graphSettings';

function useBenchmarkDatasetPapers() {
    const [benchmarkDatasetPapers, setBenchmarkDatasetPapers] = useState([]);
    const { resourceId } = useParams();

    //const []

    /*
    The function that reads the backend service response
    In the const loadBenchmarkDatasetPapers, we call useCallback(rpId => | why do we do that?
    loadBenchmarkDatasetPapers = () => {
        this.setState({ isNextPageLoading: true });
        //the response is a series of dictionaries with each item as id and label
        const benchmarkDatasetPapers = getDatasetBenchmarksByDatasetResourceId(resourceId);
        //replaced Promise.all with Promise.resolve
        await Promise.resolve([benchmarksDatasetPapers]);
        setBenchmarkDatasetPapers(benchmarksDatasetPapers);
    };
    */

    const loadBenchmarkDatasetPapers = useCallback(rpId => {
        if (rpId) {
            const result = [
                {
                    model_name: 'BERT',
                    score: 70,
                    metric: 'F-Score',
                    paper_title: 'Domain-Independent Extraction of Scientific Concepts from Research Articles',
                    paper_id: 'R38507',
                    code_url: 'https://github.com/google-research/bert'
                },
                {
                    model_name: 'SciBERT',
                    score: 80,
                    metric: 'F-Score',
                    paper_title: 'SemEval 2017 Task 10: ScienceIE - Extracting Keyphrases and Relations from Scientific Publications',
                    paper_id: 'R69282',
                    code_url: 'https://github.com/allenai/scibert'
                },
                {
                    model_name: 'KGE',
                    score: 65,
                    metric: 'F-Score',
                    paper_title: 'Open Research Knowledge Graph: Next Generation Infrastructure for Semantic Scholarly Knowledge',
                    paper_id: 'R8186',
                    code_url: 'https://gitlab.com/TIBHannover/orkg'
                }
            ];
            setBenchmarkDatasetPapers(result);
        }
    }, []);

    useEffect(() => {
        if (resourceId !== undefined) {
            loadBenchmarkDatasetPapers(resourceId);
        }
    }, [resourceId, loadBenchmarkDatasetPapers]);
    return [benchmarkDatasetPapers];
}

export default useBenchmarkDatasetPapers;
