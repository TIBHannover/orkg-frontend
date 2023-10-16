import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAbstractByDoi, getAbstractByTitle } from 'services/semanticScholar';
import { setAbstract, setIsAbstractFetched } from 'slices/viewPaperSlice';

const removeLineBreaks = text => text.replace(/(\r\n|\n|\r)/gm, ' ');

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
            let _abstract = null;

            // try to fetch abstract by DOI
            if (_doi) {
                try {
                    _abstract = await getAbstractByDoi(_doi);
                } catch (e) {
                    console.error(e);
                }
            }

            // try to fetch abstract by title is no abstract was found by DOI
            if (!_abstract) {
                try {
                    _abstract = await getAbstractByTitle(title);
                } catch (e) {
                    console.error(e);
                }
            }

            if (_abstract) {
                dispatch(setAbstract(removeLineBreaks(_abstract)));
            }

            setIsLoading(false);
        }
    };

    return { isLoading, fetchAbstract, abstract, isAbstractFetched };
};

export default useFetchAbstract;
