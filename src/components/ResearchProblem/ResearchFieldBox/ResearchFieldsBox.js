import Link from 'components/NextJsMigration/Link';
import { Badge } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverseWithSlug } from 'utils';
import PropTypes from 'prop-types';

const AuthorsBox = ({ isLoading, researchFields }) => (
    <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
        <h5>Research fields</h5>
        <div>
            <small className="text-muted">
                Research fields of <i>papers</i> that are addressing this problem
            </small>
        </div>
        {!isLoading ? (
            <div className="mb-4 mt-4 ps-3 pe-3">
                {researchFields.length > 0 ? (
                    <ul className="ps-1">
                        {researchFields.map(researchField => (
                            <li key={`rf${researchField.field.id}`}>
                                <Link
                                    href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                        researchFieldId: researchField.field.id,
                                        slug: researchField.field.label,
                                    })}
                                >
                                    {researchField.field.label}
                                    <small>
                                        <Badge className="ms-1" color="info" pill>
                                            {researchField.freq}
                                        </Badge>
                                    </small>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center mt-4 mb-4">No research fields</div>
                )}
            </div>
        ) : (
            <div className="text-center mt-4 mb-4">Loading research fields ...</div>
        )}
    </div>
);

AuthorsBox.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    researchFields: PropTypes.array.isRequired,
};

export default AuthorsBox;
