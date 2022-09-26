import { useEffect } from 'react';
import { getContributorInformationById } from 'services/backend/contributors';
import { MISC } from 'constants/graphSettings';
import { setCreatedBy } from 'slices/comparisonSlice';
import { useSelector, useDispatch } from 'react-redux';

function useCreator() {
    const id = useSelector(state => state.comparison.comparisonResource.id);
    const createdById = useSelector(state => state.comparison.comparisonResource.created_by);
    const createdBy = useSelector(state => state.comparison.createdBy);
    const dispatch = useDispatch();

    useEffect(() => {
        /**
         * Load creator user
         */
        const loadCreatedBy = () => {
            if (createdById && createdById !== MISC.UNKNOWN_ID) {
                getContributorInformationById(createdById)
                    .then(creator => {
                        dispatch(setCreatedBy(creator));
                    })
                    .catch(() => {
                        dispatch(setCreatedBy(null));
                    });
            } else {
                dispatch(setCreatedBy(null));
            }
        };

        loadCreatedBy();
    }, [createdById, id, dispatch]);

    return {
        createdBy,
    };
}
export default useCreator;
