import { CLASSES } from 'constants/graphSettings';
import { faSave, faTable, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type ContentType = {
    id: string;
    label: string;
    icon: IconDefinition;
};

export const supportedContentTypes: ContentType[] = [
    {
        id: CLASSES.DATASET,
        label: 'dataset',
        icon: faTable,
    },
    {
        id: CLASSES.SOFTWARE,
        label: 'software',
        icon: faSave,
    },
];
