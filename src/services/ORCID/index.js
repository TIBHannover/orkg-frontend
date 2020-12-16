import { submitGetRequest } from 'network';

const ORCIDLink = 'https://pub.orcid.org/v2.0/';

const getFullName = name => {
    let fullName = name['family-name'] && name['family-name'].value ? name['family-name'].value : '';
    fullName = name['given-names'] && name['given-names'].value ? `${name['given-names'].value} ${fullName}` : fullName;
    return fullName.trim();
};

export const getPersonFullNameByORCID = orcid => {
    return submitGetRequest(`${ORCIDLink}${orcid}/person`, { Accept: 'application/orcid+json' }).then(response => getFullName(response.name));
};
