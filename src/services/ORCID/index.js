import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

const url = env('ORCID_API_URL');

const getFullName = name => {
    let fullName = name['family-name'] && name['family-name'].value ? name['family-name'].value : '';
    fullName = name['given-names'] && name['given-names'].value ? `${name['given-names'].value} ${fullName}` : fullName;
    return fullName.trim();
};

export const getPersonFullNameByORCID = orcid => {
    return submitGetRequest(`${url}${orcid}/person`, { Accept: 'application/orcid+json' }).then(response => getFullName(response.name));
};
