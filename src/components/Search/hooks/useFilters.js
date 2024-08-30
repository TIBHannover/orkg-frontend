import { useState, useEffect, useCallback } from 'react';
import useParams from 'components/useParams/useParams';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';
import REGEX from 'constants/regex';
import { getClassById } from 'services/backend/classes';
import { getLinkByEntityType, getEntityTypeByID } from 'utils';
import { useSelector } from 'react-redux';
import { isEmpty, isString } from 'lodash';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import dotProp from 'dot-prop-immutable';
import { useRouter, useSearchParams } from 'next/navigation';

export const useFilters = () => {
    const { searchTerm } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    // ensure the array format is accepted by the autocomplete component
    const selectedFiltersStrings = !isEmpty(searchParams.get('types'))
        ? searchParams
              .get('types')
              ?.split(',')
              ?.map((filter) => ({ id: filter }))
        : [];

    const [selectedFilters, setSelectedFilters] = useState(selectedFiltersStrings || DEFAULT_FILTERS);
    const [value, setValue] = useState(searchTerm ?? '');
    const [createdBy, setCreatedBy] = useState(!isEmpty(searchParams.get('createdBy')) ? searchParams.get('createdBy') : null);
    const [isLoadingFilterClasses, setIsLoadingFilterClasses] = useState(true);

    const submitSearch = useCallback(
        (query) => {
            let _query;
            try {
                _query = decodeURIComponent(query);
            } catch (e) {
                _query = query;
            }

            if (isString(_query) && _query.length >= REGEX.MINIMUM_LENGTH_PATTERN && getEntityTypeByID(_query)) {
                const id = _query.substring(1);
                router.push(getLinkByEntityType(getEntityTypeByID(_query), id));
            } else {
                const _selectedFilters = createdBy
                    ? selectedFilters
                          .filter(
                              (classObj) =>
                                  !DEFAULT_FILTERS.filter((df) => !df.isCreatedByActive)
                                      .map((df) => df.id)
                                      .includes(classObj.id),
                          )
                          .map((sf) => sf.id)
                          .join(',')
                    : selectedFilters.map((sf) => sf.id).join(',');
                router.push(
                    `${reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(_query) })}?types=${_selectedFilters}&createdBy=${createdBy ?? ''}`,
                );
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [createdBy, selectedFilters],
    );

    const toggleFilter = (filterClass) => {
        // if current filters are empty and filters should be applied, don't do anything
        if (!selectedFilters.length && !filterClass) {
            submitSearch(value);
            return;
        }
        let _selectedFilters = [];
        if (filterClass === null) {
            _selectedFilters = selectedFilters.filter((s) => DEFAULT_FILTERS.map((df) => df.id).includes(s.id));
        } else if (selectedFilters.map((sf) => sf.id).includes(filterClass.id)) {
            // remove the filter
            const index = selectedFilters.map((sf) => sf.id).indexOf(filterClass.id);
            _selectedFilters = dotProp.delete(selectedFilters, index);
        } else {
            _selectedFilters = [...selectedFilters, filterClass];
        }
        setSelectedFilters(_selectedFilters);
    };

    useEffect(() => {
        setValue(searchTerm ?? '');
    }, [searchTerm]);

    useEffect(() => {
        submitSearch(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilters, submitSearch]);

    useEffect(() => {
        setIsLoadingFilterClasses(true);
        const _selectedFilters = !isEmpty(searchParams.get('types')) ? searchParams.get('types')?.split(',') : [];
        if (!_selectedFilters || _selectedFilters.length === 0) {
            setIsLoadingFilterClasses(false);
        } else {
            const classesCalls = _selectedFilters.map((classID) => {
                if (DEFAULT_FILTERS.map((df) => df.id).includes(classID)) {
                    return DEFAULT_FILTERS.find((df) => df.id === classID);
                }
                return getClassById(classID);
            });
            Promise.all(classesCalls).then((classes) => {
                setIsLoadingFilterClasses(false);
                setSelectedFilters(classes);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, searchParams]);

    return {
        user,
        value,
        selectedFilters,
        isLoadingFilterClasses,
        createdBy,
        setValue,
        setCreatedBy,
        toggleFilter,
        submitSearch,
    };
};

export default useFilters;
