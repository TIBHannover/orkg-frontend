import { ExternalServiceResponse, OptionType } from 'components/Autocomplete/types';
import { env } from 'next-runtime-env';
import { AUTOCOMPLETE_SOURCE } from 'constants/autocompleteSources';
import { CLASSES } from 'constants/graphSettings';

export const geonamesUrl = env('NEXT_PUBLIC_GEONAMES_API_URL');
export const geonamesUsername = env('NEXT_PUBLIC_GEONAMES_API_USERNAME');

export type Coordinates = {
    lat: string;
    long: string;
};

const extractIdFromGeonamesURL = (url: string) => {
    // geonameId: integer id of record in geonames database https://download.geonames.org/export/dump/
    const regex = /\/(\d+)\//;
    const match = url.match(regex);
    return match ? match[1] : '';
};

/**
 * Fetch options from geonames.org API
 */
export default async function getGeoNames({
    value,
    pageSize,
    page,
}: {
    value: string;
    page: number;
    pageSize: number;
}): Promise<ExternalServiceResponse> {
    const options: OptionType[] = [];
    const responseXML = await fetch(
        `${geonamesUrl}search?q=${encodeURIComponent(value.trim())}&maxRows=${pageSize}&startRow=${
            page * pageSize
        }&type=rdf&username=${geonamesUsername}`,
    );
    let parsedContent: Document;
    try {
        const data = await responseXML.text();
        parsedContent = new window.DOMParser().parseFromString(data, 'text/xml'); // parse as xml
    } catch (e) {
        return { options, hasMore: options.length > 0 };
    }

    const names = parsedContent.getElementsByTagName('gn:name');
    const docs = parsedContent.getElementsByTagName('gn:Feature');
    const countryCodes = parsedContent.getElementsByTagName('gn:countryCode');
    const populations = parsedContent.getElementsByTagName('gn:population');
    const lat = parsedContent.getElementsByTagName('wgs84_pos:lat');
    const long = parsedContent.getElementsByTagName('wgs84_pos:long');

    Array.from(names)?.forEach?.((name, i) => {
        const uri = docs[i]?.attributes?.getNamedItem('rdf:about')?.nodeValue ?? '';
        const geonameId = extractIdFromGeonamesURL(uri);
        const itemData: OptionType = {
            id: geonameId,
            label: name.childNodes[0].nodeValue ?? '',
            classes: [CLASSES.LOCATION],
            external: true,
            source: AUTOCOMPLETE_SOURCE.GEONAMES,
            statements: [],
            tooltipData: [],
            ontology: 'GeoNames',
            uri,
        };
        // add tooltip information
        if (countryCodes[i] && countryCodes[i].childNodes[0].nodeValue) {
            itemData.tooltipData?.push({
                property: 'Country Code',
                value: countryCodes[i].childNodes[0].nodeValue,
            });
        }
        if (populations[i] && populations[i].childNodes[0].nodeValue) {
            itemData.tooltipData?.push({
                property: 'Population',
                value: populations[i].childNodes[0].nodeValue,
            });
        }
        if (lat[i] && lat[i].childNodes[0].nodeValue) {
            itemData.tooltipData?.push({
                property: 'Latitude',
                value: lat[i].childNodes[0].nodeValue,
            });
        }
        if (long[i] && long[i].childNodes[0].nodeValue) {
            itemData.tooltipData?.push({
                property: 'Longitude',
                value: long[i].childNodes[0].nodeValue,
            });
        }
        options.push(itemData);
    });
    return { options, hasMore: options.length > 0 };
}

export async function getById(id: string): Promise<Coordinates> {
    const responseXML = await fetch(`${geonamesUrl}get?geonameId=${id}&type=rdf&username=${geonamesUsername}`);
    let parsedContent: Document;
    try {
        const data = await responseXML.text();
        parsedContent = new window.DOMParser().parseFromString(data, 'text/xml'); // parse as xml
    } catch (e) {
        return { lat: '', long: '' };
    }

    const lat = parsedContent.getElementsByTagName('lat');
    const long = parsedContent.getElementsByTagName('lng');
    return { lat: lat?.[0]?.textContent ?? '', long: long?.[0]?.textContent ?? '' };
}
