import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { getProblemsByOrganizationId } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverseWithSlug } from 'utils';
import { truncate } from 'lodash';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import ResearchProblemsModal from './ResearchProblemsModal';

const ResearchProblemBox = ({ id }) => {
    const [error, setError] = useState(null);
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadProblems = id => {
            setIsLoading(true);
            getProblemsByOrganizationId(id)
                .then(response => {
                    setProblems(response);
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsLoading(false);
                    setError(error);
                });
        };
        loadProblems(id);
    }, [id]);

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            <h5>Research problems </h5>
            {!isLoading && problems.length > 0 ? (
                <ul className="ps-3 pt-2">
                    {problems.slice(0, 5).map(rp => (
                        <li key={`p${rp.id}`}>
                            <Tippy content={rp.label} disabled={rp.label?.length <= 70}>
                                <Link to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                    {truncate(rp.label, { length: 70 })}
                                </Link>
                            </Tippy>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center mt-4 mb-4">Loading research problems ...</div>
            )}
            {!isLoading && problems.length === 0 && <div className="text-center my-4">No research problems yet</div>}
            {problems.length > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
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
