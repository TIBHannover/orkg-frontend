import ky from 'ky';
import { env } from 'next-runtime-env';

const url = env('NEXT_PUBLIC_ORCID_API_URL');
const orcidApi = ky.create({ prefixUrl: url });

const getFullName = (name: { 'family-name': { value: string }; 'given-names': { value: string } }) => {
    let fullName = name['family-name'] && name['family-name'].value ? name['family-name'].value : '';
    fullName = name['given-names'] && name['given-names'].value ? `${name['given-names'].value} ${fullName}` : fullName;
    return fullName.trim();
};

const getPersonFullNameByORCID = (orcid: string) =>
    orcidApi
        .get(`${orcid}/person`, { headers: { Accept: 'application/orcid+json' } })
        .json()
        /* @ts-expect-error API typing missing */
        .then((response) => getFullName(response.name));

export default getPersonFullNameByORCID;
