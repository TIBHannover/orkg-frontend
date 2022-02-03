import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Label } from 'reactstrap';

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
    }, []);

    const onChangeObservatory = selected => {
        props.onChangeObservatory(selected ?? null);
        props.onChangeOrganization(selected?.organizations[0] ?? null);
        setOptionsOrganizations(selected?.organizations ?? null);
    };

    const onChangeOrganization = selected => {
        props.onChangeOrganization(selected ?? null);
    };

    useEffect(() => {
        if (options.length && props.observatory) {
            const selected = options.find(o => props.observatory.id === o.id);
            props.onChangeObservatory(selected ?? null);
            setOptionsOrganizations(selected.organizations);
        }
    }, [options, props, props.observatory]);

    const CustomOptionObservatory = innerProps => (
        <components.Option {...innerProps}>
            <div>{innerProps.data.name}</div>
            <small className={!innerProps.isSelected ? 'text-muted' : ''}>
                {innerProps.data.organizations.length === 1
                    ? innerProps.data.organizations[0].name
                    : innerProps.data.organizations.map(or => or.name).join(', ')}
            </small>
        </components.Option>
    );

    const CustomOptionOrganization = innerProps => (
        <components.Option {...innerProps}>
            <div className="d-flex">
                <LogoContainer className="me-2">
                    <img alt={innerProps.data.name} src={innerProps.data.logo} />
                </LogoContainer>

                {innerProps.data.name}
            </div>
        </components.Option>
    );

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
                inputId={props.inputId}
                isClearable={true}
            />

            <br />
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
            />
        </>
    );
}

AutocompleteObservatory.propTypes = {
    onChangeObservatory: PropTypes.func,
    onChangeOrganization: PropTypes.func,
    observatory: PropTypes.object,
    organization: PropTypes.object,
    inputId: PropTypes.string
};

export default AutocompleteObservatory;
