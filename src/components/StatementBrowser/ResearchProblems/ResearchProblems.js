import { forwardRef } from 'react';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { reverseWithSlug } from 'utils';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { CLASSES } from 'constants/graphSettings';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import NoData from 'components/StatementBrowser/NoData/NoData';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const ResearchProblemButton = styled.span`
    white-space: normal;
    text-align: left;
    user-select: text !important;
`;

const ResearchProblems = forwardRef((props, ref) => {
    return (
        <div ref={ref}>
            <Title className="mt-0">Research problems</Title>
            <>
                <div>
                    {!props.enableEdit && (
                        <div className="mt-2 pb-2">
                            {props.researchProblems?.length > 0 &&
                                props.researchProblems.map((problem, index) => (
                                    <div key={index} className="mb-2">
                                        <Link
                                            to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                researchProblemId: problem.id,
                                                slug: problem.label
                                            })}
                                        >
                                            <ResearchProblemButton className="btn btn-link p-0 border-0 align-baseline">
                                                <DescriptionTooltip id={problem.id} typeId={CLASSES.PROBLEM}>
                                                    {problem.label}
                                                </DescriptionTooltip>
                                            </ResearchProblemButton>
                                        </Link>
                                    </div>
                                ))}
                            {props.researchProblems?.length === 0 && <i>No research problems added yet.</i>}
                        </div>
                    )}
                    {props.enableEdit && (
                        <StatementItem id={props.id} enableEdit={props.enableEdit} syncBackend={props.syncBackend} resourceId={props.resourceId} />
                    )}
                </div>
            </>
            <Title className="mt-2">Contribution Data</Title>
            {props.isLastItem && <NoData enableEdit={props.enableEdit} />}
        </div>
    );
});

ResearchProblems.propTypes = {
    id: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    researchProblems: PropTypes.array.isRequired
};

export default ResearchProblems;
