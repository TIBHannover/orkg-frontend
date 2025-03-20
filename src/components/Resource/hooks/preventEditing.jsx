import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { env } from 'next-runtime-env';
import { CLASSES } from 'constants/graphSettings';
import { Alert } from 'reactstrap';

const PREVENT_EDIT_CASES = [
    {
        condition: (resource) => env('NEXT_PUBLIC_PWC_USER_ID') === resource.created_by,
        preventModalProps: (resource) => ({
            header: 'We are working on it!',
            content: (
                <>
                    This resource was imported from an external source and our provenance feature is in active development, and due to that, this
                    resource cannot be edited. <br />
                    Meanwhile, you can visit{' '}
                    <a
                        href={
                            resource.label ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${resource.label}` : 'https://paperswithcode.com/'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                    </a>{' '}
                    website to suggest changes.
                </>
            ),
        }),
    },
    {
        condition: (resource) => resource.classes.includes(CLASSES.RESEARCH_FIELD),
        preventModalProps: () => ({
            header: 'Research fields taxonomy!',
            content: (
                <>
                    This resource can not be edited. Please visit the{' '}
                    <a target="_blank" rel="noopener noreferrer" href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy">
                        ORKG help center
                    </a>{' '}
                    if you have any suggestions to improve the research fields taxonomy.
                </>
            ),
        }),
    },
    {
        condition: (resource) => resource.classes.includes(CLASSES.COMPARISON_PUBLISHED),
        warningOnEdit: (
            <Alert className="container" color="danger">
                This resource should not be edited because it is published, please make sure that you know what are you doing!
            </Alert>
        ),
        preventModalProps: () => ({
            header: 'Editing not possible',
            content: <>This resource can not be edited because it is a published comparison.</>,
        }),
    },
];

const getPreventEditCase = (resource) => {
    for (const preventCase of PREVENT_EDIT_CASES) {
        // eslint-disable-next-line no-await-in-loop
        const resultCondition = preventCase.condition(resource);
        if (resultCondition) {
            return preventCase;
        }
    }
    return null;
};

export default getPreventEditCase;
