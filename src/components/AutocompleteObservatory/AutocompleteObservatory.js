import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { FormGroup, Label } from 'reactstrap';
import { getObservatories } from 'services/backend/observatories';
import { getConferences, getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import styled from 'styled-components';

const LogoContainer = styled.div`
    overflow: hidden;
    width: 70px;
    height: 32px;
    text-align: center;
    & img {
        width: auto; // to maintain aspect ratio
        height: 100%;
        background: #fff;
    }
`;

const PAGE_SIZE = 10;
const MAXIMUM_DESCRIPTION_LENGTH = 120;

function AutocompleteObservatory(props) {
    const [optionsOrganizations, setOptionsOrganizations] = useState([]);
    const [conferences, setConferences] = useState([]);

    useEffect(() => {
        const loadConferences = async () => {
            const callConferences = await getConferences();
            setConferences(callConferences);
            setOptionsOrganizations(callConferences);
        };
        loadConferences();
    }, []);

    const loadObservatoryOptions = async (search, prevOptions, { page }) => {
        const emptyList = {
            options: prevOptions,
            hasMore: false,
            additional: {
                page: 0,
            },
        };
        try {
            const result = await getObservatories({
                q: search.trim(),
                size: PAGE_SIZE,
                page,
            });
            const items = result.content;
            const hasMore = !result.last;
            return {
                options: items,
                hasMore,
                additional: {
                    page: page + 1,
                },
            };
        } catch (err) {
            return emptyList;
        }
    };

    const onChangeObservatory = async selected => {
        props.onChangeObservatory(selected ?? null);
        const data = selected ? await Promise.all(selected?.organization_ids.map(o => getOrganization(o))) : null;
        // Select the first organization
        props.onChangeOrganization(data?.[0] ?? null);
        setOptionsOrganizations(selected ? data : conferences);
    };

    const onChangeOrganization = selected => {
        props.onChangeOrganization(selected ?? null);
    };

    const CustomOptionObservatory = innerProps => (
        <components.Option {...innerProps}>
            <div>{innerProps.data.name}</div>
            <small className={!innerProps.isSelected ? 'text-muted' : ''}>
                {truncate(innerProps.data.description ?? '', { length: MAXIMUM_DESCRIPTION_LENGTH })}
            </small>
        </components.Option>
    );

    const CustomOptionOrganization = innerProps => (
        <components.Option {...innerProps}>
            <div className="d-flex">
                <LogoContainer className="me-2">
                    <img alt={innerProps.data.name} src={getOrganizationLogoUrl(innerProps.data?.id)} />
                </LogoContainer>

                {innerProps.data.name}
            </div>
        </components.Option>
    );

    return (
        <>
            <p>
                <small>Clear the observatory field to select a conference in the organization field.</small>
            </p>
            <FormGroup>
                <Label for="select-observatory">Select an observatory</Label>
                <AsyncPaginate
                    value={props.observatory}
                    components={{ Option: CustomOptionObservatory }}
                    cacheOptions
                    additional={{
                        page: 0,
                    }}
                    loadOptions={loadObservatoryOptions}
                    onChange={onChangeObservatory}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-observatory"
                    isClearable={true}
                    classNamePrefix="react-select"
                />
            </FormGroup>
            <FormGroup>
                <Label for="select-organization">Select an organization</Label>
                <Select
                    value={props.organization}
                    components={{ Option: CustomOptionOrganization }}
                    options={optionsOrganizations}
                    onChange={onChangeOrganization}
                    getOptionValue={({ id }) => id}
                    getOptionLabel={({ name }) => name}
                    inputId="select-organization"
                    isClearable={true}
                    classNamePrefix="react-select"
                />
            </FormGroup>
            <SelectGlobalStyle />
        </>
    );
}

AutocompleteObservatory.propTypes = {
    onChangeObservatory: PropTypes.func,
    onChangeOrganization: PropTypes.func,
    observatory: PropTypes.object,
    organization: PropTypes.object,
};

export default AutocompleteObservatory;
