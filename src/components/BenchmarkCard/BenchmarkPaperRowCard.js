import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGithub, faGitlab } from '@fortawesome/free-brands-svg-icons';

function addTableRow(props) {
    const url = props.benchmark_details.code_url;
    let faIcon = faGithub;
    if (url.includes('gitlab')) {
        faIcon = faGitlab;
    }
    return (
        <tr>
            <td>
                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.benchmark_details.paper_id })} style={{ textDecoration: 'none' }}>
                    {props.benchmark_details.paper_title ?? '-'}
                </Link>
            </td>
            <td>{props.benchmark_details.model_name ?? '-'}</td>
            <td>{props.benchmark_details.score ?? '-'}</td>
            <td>{props.benchmark_details.metric ?? '-'}</td>
            <td>
                <a href={props.benchmark_details.code_url ?? '-'} target="_blank">
                    <Icon icon={faIcon} className="icon ml-2 mr-2" />
                </a>
            </td>
        </tr>
    );
}

function BenchmarkPaperRowCard(props) {
    return addTableRow(props);
}

BenchmarkPaperRowCard.propTypes = {
    benchmark_details: PropTypes.object.isRequired
};

export default BenchmarkPaperRowCard;
