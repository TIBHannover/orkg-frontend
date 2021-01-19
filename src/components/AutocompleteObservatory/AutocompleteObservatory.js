import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import PropTypes from 'prop-types';
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

function AutocompleteObservatory(props) {
    const [options, setOptions] = useState([]);
    const [optionsOrganizations, setOptionsOrganizations] = useState([]);

    useEffect(() => {
        const loadOptions = () => {
            const observatories = getAllObservatories();
            const organizations = getAllOrganizations();

            return Promise.all([observatories, organizations]).then(data => {
                const items = [];
                for (const observatory of data[0]) {
                    const orgs = data[1].filter(org => observatory.organization_ids.includes(org.id));
                    items.push({
                        ...observatory,
                        organizations: orgs
                    });
                }
                setOptions(items);
            });
        };
        loadOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeObservatory = selected => {
        props.onChangeObservatory(selected);
        props.onChangeOrganization(selected.organizations[0]);
        setOptionsOrganizations(selected.organizations);
    };

    const onChangeOrganization = selected => {
        props.onChangeOrganization(selected);
    };

    useEffect(() => {
        if (options.length && props.observatory) {
            const selected = options.find(o => props.observatory.id === o.id);
            props.onChangeObservatory(selected);
            setOptionsOrganizations(selected.organizations);
        }
    }, [options, props, props.observatory]);

    const CustomOptionObservatory = innerProps => {
        return (
            <components.Option {...innerProps}>
                <div>{innerProps.data.name}</div>
                <small className={!innerProps.isSelected ? 'text-muted' : ''}>
                    {innerProps.data.organizations.length === 1
                        ? innerProps.data.organizations[0].name
                        : innerProps.data.organizations.map(or => or.name).join(', ')}
                </small>
            </components.Option>
        );
    };

    const CustomOptionOrganization = innerProps => {
        return (
            <components.Option {...innerProps}>
                <div className="d-flex">
                    <LogoContainer className="mr-2">
                        <img alt={innerProps.data.name} src={innerProps.data.logo} />
                    </LogoContainer>

                    {innerProps.data.name}
                </div>
            </components.Option>
        );
    };

    return (
        <>
            <Select
                value={props.observatory}
                components={{ Option: CustomOptionObservatory }}
                cacheOptions
                options={options}
                onChange={onChangeObservatory}
                getOptionValue={({ id }) => id}
                getOptionLabel={({ name }) => name}
            />

            <br />
            <p>Select an organization:</p>
            <Select
                value={props.organization}
                components={{ Option: CustomOptionOrganization }}
                options={optionsOrganizations}
                onChange={onChangeOrganization}
                getOptionValue={({ id }) => id}
                getOptionLabel={({ name }) => name}
            />
        </>
    );
}

AutocompleteObservatory.propTypes = {
    onChangeObservatory: PropTypes.func,
    onChangeOrganization: PropTypes.func,
    observatory: PropTypes.object,
    organization: PropTypes.object
};

export default AutocompleteObservatory;
