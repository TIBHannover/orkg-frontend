import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAbstractByDoi } from 'services/semanticScholar';
import { setAbstract, setIsAbstractFetched } from 'slices/viewPaperSlice';

const useFetchAbstract = () => {
    const abstract = useSelector(state => state.viewPaper.abstract);
    const isAbstractFetched = useSelector(state => state.viewPaper.isAbstractFetched);
    const title = useSelector(state => state.viewPaper.paperResource)?.label;
    const doi = useSelector(state => state.viewPaper.doi)?.label;
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const fetchAbstract = async () => {
        if (!abstract && !isAbstractFetched) {
            dispatch(setIsAbstractFetched(true)); // set to true to prevent fetching the abstract again, don't wait until promise is resolved

            let _doi;
            try {
                _doi = doi.substring(doi.indexOf('10.'));
            } catch {
                _doi = false;
            }
            if (!title && !_doi) {
                return;
            }
            setIsLoading(true);
            try {
                let fetchedAbstract = await getAbstractByDoi(_doi);
                // remove line breaks from the abstract
                fetchedAbstract = fetchedAbstract?.replace(/(\r\n|\n|\r)/gm, ' ');
                dispatch(setAbstract(fetchedAbstract));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return { isLoading, fetchAbstract, abstract, isAbstractFetched };
};

export default useFetchAbstract;
