import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';

const url = env('NEXT_PUBLIC_ORCID_API_URL');

const getFullName = (name) => {
    let fullName = name['family-name'] && name['family-name'].value ? name['family-name'].value : '';
    fullName = name['given-names'] && name['given-names'].value ? `${name['given-names'].value} ${fullName}` : fullName;
    return fullName.trim();
};

const getPersonFullNameByORCID = (orcid) =>
    submitGetRequest(`${url}${orcid}/person`, { Accept: 'application/orcid+json' }).then((response) => getFullName(response.name));

export default getPersonFullNameByORCID;
