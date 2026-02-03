import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { env } from 'next-runtime-env';

import { CLASSES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';

export type PreventEditCase = {
    condition: (resource: Thing) => boolean;
    message: (resource: Thing) => React.ReactNode;
    warningOnEdit?: React.ReactNode;
};

const PREVENT_EDIT_CASES: PreventEditCase[] = [
    {
        // TODO: remove snake case handling after finishing services migration
        condition: (entity: Thing) => env('NEXT_PUBLIC_PWC_USER_ID') === ('created_by' in entity ? entity.created_by : entity.createdBy),
        message: (entity: Thing) => (
            <>
                This resource was imported from an external source and our provenance feature is in active development, and due to that, this resource
                cannot be edited. Meanwhile, you can visit{' '}
                <a
                    href={entity.label ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${entity.label}` : 'https://paperswithcode.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                </a>{' '}
                website to suggest changes.
            </>
        ),
    },
    {
        condition: (entity: Thing) => 'classes' in entity && entity.classes.includes(CLASSES.RESEARCH_FIELD),
        message: (entity: Thing) => (
            <>
                This resource can not be edited. Please visit the{' '}
                <a target="_blank" rel="noopener noreferrer" href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy">
                    ORKG help center
                </a>{' '}
                if you have any suggestions to improve the research fields taxonomy.
            </>
        ),
    },
    {
        condition: (entity: Thing) => 'classes' in entity && entity.classes.includes(CLASSES.COMPARISON_PUBLISHED),
        message: (entity: Thing) => <>This resource can not be edited because it is a published comparison.</>,
    },
    {
        condition: (entity: Thing) => 'classes' in entity && entity.classes.includes(CLASSES.LIST),
        message: (entity: Thing) => <>This resource can not be edited because it is a list.</>,
    },
];

const getPreventEditCase = (entity: Thing) => {
    for (const preventCase of PREVENT_EDIT_CASES) {
        const resultCondition = preventCase.condition(entity);
        if (resultCondition) {
            return preventCase;
        }
    }
    return null;
};

export default getPreventEditCase;
