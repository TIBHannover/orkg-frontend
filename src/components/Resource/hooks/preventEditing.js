import { Alert } from 'reactstrap';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import env from 'components/NextJsMigration/env';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const PREVENT_EDIT_CASES = [
    {
        condition: resource => env('PWC_USER_ID') === resource.created_by,
        preventModalProps: resource => ({
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
                        paperswithcode <Icon icon={faExternalLinkAlt} className="me-1" />
                    </a>{' '}
                    website to suggest changes.
                </>
            ),
        }),
    },
    {
        condition: resource => resource.classes.includes(CLASSES.RESEARCH_FIELD),
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
        condition: async resource => {
            if (resource.classes.includes(CLASSES.COMPARISON)) {
                const st = await getStatementsBySubjectAndPredicate({ subjectId: resource.id, predicateId: PREDICATES.HAS_DOI });
                if (st.length > 0) {
                    return true;
                }
                return false;
            }
            return false;
        },
        warningOnEdit: (
            <Alert className="container" color="danger">
                This resource should not be edited because it has a published DOI, please make sure that you know what are you doing!
            </Alert>
        ),
        preventModalProps: () => ({
            header: 'Published DOI!',
            content: <>This resource can not be edited because it has a published DOI.</>,
        }),
    },
];

const getPreventEditCase = async resource => {
    for (const preventCase of PREVENT_EDIT_CASES) {
        // eslint-disable-next-line no-await-in-loop
        const resultCondition = await preventCase.condition(resource);
        if (resultCondition) {
            return preventCase;
        }
    }
    return null;
};

export default getPreventEditCase;
