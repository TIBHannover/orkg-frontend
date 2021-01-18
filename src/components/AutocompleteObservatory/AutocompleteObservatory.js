import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import PropTypes from 'prop-types';

function AutocompleteObservatory(props) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const loadOptions = () => {
            const observatories = getAllObservatories();
            const organizations = getAllOrganizations();

            return Promise.all([observatories, organizations]).then(data => {
                const items = [];

                for (const observatory of data[0]) {
                    for (let i = 0; i < observatory.organization_ids.length; i++) {
                        const org = data[1].find(o1 => o1.id === observatory.organization_ids[i]);
                        items.push({ value: observatory.id, label: observatory.name, organizationId: org.id, org: org.name });
                    }
                }
                setOptions(items);
            });
        };

        loadOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const CustomOption = innerProps => {
        console.log(innerProps);
        return (
            <components.Option {...innerProps}>
                <div>{innerProps.data.label}</div>
                <small className="text-muted">{innerProps.data.org}</small>
            </components.Option>
        );
    };

    return <Select components={{ Option: CustomOption }} cacheOptions options={options} onChange={props.onChange} />;
}

AutocompleteObservatory.propTypes = {
    onChange: PropTypes.func
};

export default AutocompleteObservatory;
