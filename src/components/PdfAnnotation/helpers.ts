import { isString } from 'lodash';

import { ReferenceType } from '@/components/PdfAnnotation/types';

// Builds an object to convert citation keys used in the paper's text (e.g., [10]) and maps them to the internal IDs
export const citationKeyToInternalId = (parsedPdfData: Document) => {
    const mapping: Record<string, string> = {};
    const references = parsedPdfData?.querySelectorAll('ref[type="bibr"]');
    for (const reference of references || []) {
        const internalId = reference.getAttribute('target');
        if (internalId) {
            const internalIdClean = internalId.replace('#', '');
            const citationKey = reference.innerHTML;
            const citationKeyClean = citationKey.replace('[', '').replace(']', '');
            const [number] = citationKeyClean.match(/\d+/) || [];
            if (!Number.isNaN(Number(number)) && number) {
                mapping[number] = internalIdClean;
            }
        }
    }
    return mapping;
};

export const formatReferenceValue = (value: string, formattingType: ReferenceType): string | undefined => {
    let _value = value;
    if (formattingType === 'numerical' && isString(_value)) {
        const _valueMatch = _value.match(/\[\d+\]/i) || '';
        if (!_valueMatch || _valueMatch.length === 0) {
            return undefined;
        }
        const [v] = _valueMatch || [];
        _value = v?.replace('[', '').replace(']', '') || '';
        return _value;
    }
    if (formattingType === 'author-names' && isString(_value)) {
        _value = _value.replace(/\s/g, ''); // remove spaces
        _value = _value.replace('&amp;', '&');
        _value = _value.replace('(', '');
        _value = _value.replace(')', '');
        _value = _value.replace('.', '');
        _value = _value.replace(',', '');
        _value = _value.toLowerCase();
        return _value;
    }
    return undefined;
};

export const generateCitationKeyFromAuthors = (reference: Element, formattingType: ReferenceType) => {
    const authors = reference.querySelectorAll('analytic author');

    let key = '';

    for (const [index, author] of authors.entries()) {
        let lastName = '';

        const _lastName = author.querySelector('surname');
        if (_lastName) {
            lastName = _lastName.innerHTML;
        }

        if (index === 0) {
            key = lastName;

            if (formattingType === 'author-names') {
                if (authors.length >= 2) {
                    key += 'etal';
                }
                break;
            }
        } else if (index === 1 && authors.length === 2) {
            key = `${key}and${lastName}`;
        } else if (index === 2) {
            key += 'etal';
            break;
        }
    }
    key = isString(key) ? key.toLowerCase() : '';

    return key;
};

export const parseAuthors = (reference: Element) => {
    const authors = reference.querySelectorAll('analytic author');

    const authorsParsed = [];

    for (const author of authors) {
        let firstName = '';
        let middleName = '';
        let lastName = '';

        const _firstName = author.querySelector('forename[type="first"]');
        if (_firstName) {
            firstName = `${_firstName.innerHTML} `;
        }

        const _middleName = author.querySelector('forename[type="middle"]');
        if (_middleName) {
            middleName = `${_middleName.innerHTML} `;
        }

        const _lastName = author.querySelector('surname');
        if (_lastName) {
            lastName = _lastName.innerHTML;
        }

        authorsParsed.push(firstName + middleName + lastName);
    }

    return authorsParsed;
};

export const getAllReferences = (parsedPdfData: Document, formattingType: ReferenceType) => {
    const references = parsedPdfData?.querySelectorAll('back [type="references"] biblStruct');
    const referencesParsed: Record<string, { title: string; doi: string; publicationMonth: string; publicationYear: string; authors: string[] }> = {};
    for (const reference of references || []) {
        let title = '';
        let doi = '';
        let publicationMonth = '';
        let publicationYear = '';
        let authors = [];

        // title
        const _title = reference.querySelector('analytic title') || reference.querySelector('monogr title');
        if (_title) {
            title = _title.innerHTML;
        }

        // doi
        const _doi = reference.querySelector('idno[type="DOI"]');
        if (_doi) {
            doi = _doi.innerHTML;
        }

        // publication month & year
        const publishedDate = reference.querySelector('monogr imprint date[when]');
        if (publishedDate) {
            const parsedData = publishedDate.getAttribute('when')?.split('-') || [];

            if (parsedData.length > 0) {
                publicationYear = parseInt(parsedData[0], 10).toString();
            }
            if (parsedData.length > 1) {
                publicationMonth = parseInt(parsedData[1], 10).toString();
            }
        }

        // authors
        authors = parseAuthors(reference);

        let _id = '';
        if (formattingType === 'numerical') {
            _id = reference.getAttribute('xml:id') || '';
        } else {
            _id = generateCitationKeyFromAuthors(reference, formattingType) + publicationYear;
        }

        referencesParsed[_id] = {
            title,
            doi,
            publicationMonth,
            publicationYear,
            authors,
        };
    }
    return referencesParsed;
};
