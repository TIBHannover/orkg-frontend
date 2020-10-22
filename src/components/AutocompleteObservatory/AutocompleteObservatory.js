import React from 'react';
import AsyncSelect from 'react-select/async';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const StyledAutoCompleteInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    &.default {
        height: auto !important;
        min-height: calc(1.8125rem + 4px);
    }
    cursor: text;
    padding: 0 !important;
    width: 65%;
    margin-left: 10px;
`;

function AutocompleteObservatory(props) {
    const loadOptions = () => {
        const observatories = getAllObservatories();
        const organizations = getAllOrganizations();

        return Promise.all([observatories, organizations]).then(async data => {
            const items = [];

            for (const observatory of data[0]) {
                for (let i = 0; i < observatory.organization_ids.length; i++) {
                    const org = data[1].find(o1 => o1.id === observatory.organization_ids[i]);
                    const v = org.id + ';' + observatory.id;
                    const l = 'Organization: ' + org.name + ' , Observatory: ' + observatory.name;
                    items.push({ value: v, label: l });
                }
            }
            return items;
        });
    };

    return (
        <StyledAutoCompleteInputFormControl>
            <AsyncSelect cacheOptions loadOptions={loadOptions} defaultOptions onChange={props.onChange} />
        </StyledAutoCompleteInputFormControl>
    );
}

AutocompleteObservatory.propTypes = {
    onChange: PropTypes.func
};

export default AutocompleteObservatory;
