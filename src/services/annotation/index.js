/**
 * Services file for the annotation service
 * https://gitlab.com/TIBHannover/orkg/annotation
 */

import { submitPostRequest, submitPutRequest } from 'network';
import env from '@beam-australia/react-env';

export const annotationServiceUrl = env('ANNOTATION_SERVICE_URL');

export const getAnnotations = abstract =>
    submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });

export const classifySentence = ({ sentence, labels }) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const data = {
        sentence,
        labels,
    };

    return submitPutRequest(`${annotationServiceUrl}classifySentence/`, headers, data);
};

export const summarizeText = ({ text, ratio }) => {
    const headers = {
        'Content-Type': 'text/plain',
    };

    return submitPutRequest(`${annotationServiceUrl}summarizeText/?ratio=${ratio}`, headers, text, false);
};
