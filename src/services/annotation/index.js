/**
 * Services file for the annotation service
 * https://gitlab.com/TIBHannover/orkg/annotation
 */

import env from 'components/NextJsMigration/env';
import { submitPostRequest } from 'network';

export const annotationServiceUrl = env('NEXT_PUBLIC_ANNOTATION_SERVICE_URL');

export const getAnnotations = abstract =>
    submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });
