import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import ResearchProblemsModal from 'components/Conference/ResearchProblemsModal';
import Tooltip from 'components/FloatingUI/Tooltip';
import ROUTES from 'constants/routes';
import { truncate } from 'lodash';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { getProblemsByOrganizationId } from 'services/backend/organizations';
import { reverseWithSlug } from 'utils';

const ResearchProblemBox = ({ id }) => {
    const [error, setError] = useState(null);
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadProblems = (id) => {
            setIsLoading(true);
            getProblemsByOrganizationId(id)
                .then((response) => {
                    setProblems(response.content);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    setError(error);
                });
        };
        loadProblems(id);
    }, [id]);

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />}</>}
            <h5>Research problems </h5>
            {!isLoading && problems.length > 0 && (
                <ul className="ps-3 pt-2">
                    {problems.slice(0, 5).map((rp) => (
                        <li key={`p${rp.id}`}>
                            <Tooltip content={rp.label} disabled={rp.label?.length <= 70}>
                                <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                    {truncate(rp.label, { length: 70 })}
                                </Link>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
            {isLoading && <div className="text-center mt-4 mb-4">Loading research problems ...</div>}
            {!isLoading && problems.length === 0 && <div className="text-center my-4">No research problems yet</div>}
            {problems.length > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} problems={problems} />}
                </div>
            )}
        </div>
    );
};

ResearchProblemBox.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ResearchProblemBox;
