import Link from 'components/NextJsMigration/Link';
import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';
import { filterSubjectOfStatementsByPredicateAndClass, getResourceLink } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

function CustomNode({ data }) {
    const [paper, setPaper] = useState(null);
    useEffect(() => {
        const loadPaper = () => {
            getStatementsByObjectAndPredicate({ objectId: data.id, predicateId: PREDICATES.HAS_CONTRIBUTION }).then((statements) => {
                setPaper(filterSubjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_CONTRIBUTION, true, CLASSES.PAPER));
            });
        };

        if (data?.classes?.includes(CLASSES.CONTRIBUTION)) {
            loadPaper();
        }
    }, [data]);

    return (
        <>
            <Handle type="target" position={Position.Top} />
            {data.id !== data.label ? (
                <Link href={getResourceLink(data.classes?.[0], data.id)}>
                    {paper?.id ? `${paper.label} - ` : ''}
                    {data.label}
                </Link>
            ) : (
                <>{data.label}</>
            )}
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}

CustomNode.propTypes = {
    data: PropTypes.object,
};
export default CustomNode;
