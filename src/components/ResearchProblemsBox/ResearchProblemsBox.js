import { useState } from 'react';
import { Button } from 'reactstrap';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import useResearchFieldProblems from 'components/ResearchProblemsBox/hooks/useResearchFieldProblems';
import ResearchProblemsModal from './ResearchProblemsModal';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { reverseWithSlug } from 'utils';
import Tippy from '@tippyjs/react';

const ResearchProblemsBox = ({ researchFieldId }) => {
    const { problems, isLoading, totalElements } = useResearchFieldProblems({ researchFieldId, pageSize: 5 });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>Research problems</h5>
            <div className="flex-grow-1">
                {!isLoading && totalElements > 0 && (
                    <div className="ps-3 pt-2">
                        {problems.map(rp => (
                            <li key={`rp${rp.id}`}>
                                <Tippy content={rp.label} disabled={rp.label?.length <= 70}>
                                    <Link to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                        {truncate(rp.label, { length: 70 })}
                                        {/** <small>
                                            <Badge className="ms-1" color="info" pill>
                                                {rp.papers}
                                            </Badge>
                                        </small>*/}
                                    </Link>
                                </Tippy>
                            </li>
                        ))}
                    </div>
                )}
                {!isLoading && totalElements === 0 && <>No research problems.</>}
            </div>
            {isLoading && (
                <div className="mt-4 mb-4">
                    <ContentLoader height={130} width={300} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                        <rect x="0" y="5" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="15" rx="3" ry="3" width="150" height="5" />
                        <rect x="0" y="35" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="45" rx="3" ry="3" width="150" height="5" />
                        <rect x="0" y="65" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="75" rx="3" ry="3" width="150" height="5" />
                    </ContentLoader>
                </div>
            )}
            {totalElements > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />}
                </div>
            )}
        </div>
    );
};

ResearchProblemsBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default ResearchProblemsBox;
