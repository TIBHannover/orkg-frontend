import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useParams, useHistory } from 'react-router-dom';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';
import REGEX from 'constants/regex';
import { getClassById } from 'services/backend/classes';
import { getArrayParamFromQueryString, getParamFromQueryString, getLinkByEntityType, getEntityTypeByID } from 'utils';
import { useSelector } from 'react-redux';
import { isString } from 'lodash';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import dotProp from 'dot-prop-immutable';

export const useFilters = () => {
    const { searchTerm } = useParams();
    const location = useLocation();
    const history = useHistory();
    const user = useSelector(state => state.auth.user);
    // ensure the array format is accepted by the autocomplete component
    const selectedFiltersStrings = getArrayParamFromQueryString(decodeURIComponent(location.search), 'types').map(filter => ({ id: filter }));
    const [selectedFilters, setSelectedFilters] = useState(selectedFiltersStrings ? selectedFiltersStrings : DEFAULT_FILTERS);
    const [value, setValue] = useState(searchTerm ?? '');
    const [byMe, setByMe] = useState(getParamFromQueryString(location.search, 'byMe', true));
    const [isLoadingFilterClasses, setIsLoadingFilterClasses] = useState(true);

    const toggleFilter = filterClass => {
        // if current filters are empty and filters should be applied, don't do anything
        if (!selectedFilters.length && !filterClass) {
            return;
        }
        let _selectedFilters = [];
        if (filterClass === null) {
            _selectedFilters = selectedFilters.filter(s => DEFAULT_FILTERS.map(df => df.id).includes(s.id));
        } else {
            if (selectedFilters.map(sf => sf.id).includes(filterClass.id)) {
                // remove the filter
                const index = selectedFilters.map(sf => sf.id).indexOf(filterClass.id);
                _selectedFilters = dotProp.delete(selectedFilters, index);
            } else {
                _selectedFilters = [...selectedFilters, filterClass];
            }
        }
        setSelectedFilters(_selectedFilters);
    };

    const submitSearch = e => {
        e.preventDefault();

        const query = decodeURIComponent(value);
        if (isString(query) && value.length >= REGEX.MINIMUM_LENGTH_PATTERN && getEntityTypeByID(value)) {
            const id = value.substring(1);
            history.push(getLinkByEntityType(getEntityTypeByID(value), id));
        } else {
            const _selectedFilters = byMe
                ? selectedFilters
                      .filter(
                          classObj =>
                              !DEFAULT_FILTERS.filter(df => !df.isByMeActive)
                                  .map(df => df.id)
                                  .includes(classObj.id)
                      )
                      .map(sf => sf.id)
                      .join(',')
                : selectedFilters.map(sf => sf.id).join(',');
            history.push(reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) }) + '?types=' + _selectedFilters + '&byMe=' + byMe);
        }
    };

    useEffect(() => {
        setValue(searchTerm ?? '');
    }, [searchTerm]);

    useEffect(() => {
        setIsLoadingFilterClasses(true);
        const _selectedFilters = getArrayParamFromQueryString(decodeURIComponent(location.search), 'types');
        if (!_selectedFilters || _selectedFilters.length === 0) {
            setIsLoadingFilterClasses(false);
        } else {
            const classesCalls = _selectedFilters.map(classID => {
                if (DEFAULT_FILTERS.map(df => df.id).includes(classID)) {
                    return DEFAULT_FILTERS.find(df => df.id === classID);
                }
                return getClassById(classID);
            });
            return Promise.all(classesCalls).then(classes => {
                setIsLoadingFilterClasses(false);
                setSelectedFilters(classes);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, searchTerm]);

    return {
        user,
        value,
        selectedFilters,
        isLoadingFilterClasses,
        byMe,
        setValue,
        setByMe,
        toggleFilter,
        submitSearch
    };
};

export default useFilters;
