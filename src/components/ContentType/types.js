import { CLASSES } from 'constants/graphSettings';
import { faSave, faTable } from '@fortawesome/free-solid-svg-icons';

export const supportedContentTypes = [
    {
        id: CLASSES.DATASET,
        label: 'dataset',
        icon: faTable
    },
    {
        id: CLASSES.SOFTWARE,
        label: 'software',
        icon: faSave
    }
];
