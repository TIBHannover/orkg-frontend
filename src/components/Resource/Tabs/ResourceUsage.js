import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ListPage from 'components/ListPage/ListPage';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { getPapersLinkedToResource } from 'services/backend/papers';
import { getStatementsBySubjects } from 'services/backend/statements';
import { addAuthorsToStatementBundle, convertPaperToNewFormat, getPaperData } from 'utils';

function ResourceUsage({ id }) {
    const [statements, setStatements] = useState([]);
    const [totalPapers, setTotalPapers] = useState(0);

    const renderListItem = (object) => {
        const paperCardData = statements.find(({ id: _id }) => _id === object.id);
        return (
            <PaperCard
                paper={convertPaperToNewFormat({
                    title: object.label,
                    ...object,
                    ...(!paperCardData ? { isLoading: true } : getPaperData(object, paperCardData?.statements)),
                })}
                paths={object.path}
                key={object.id}
            />
        );
    };

    const fetchItems = async ({ page, pageSize }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getPapersLinkedToResource({
            id,
            page,
            size: pageSize,
        });
        setTotalPapers(totalElements);
        // promise to prevent blocking loading of the additional paper data
        if (items.length > 0) {
            getStatementsBySubjects({ ids: items.map((p) => p.id) })
                .then((_statements) => addAuthorsToStatementBundle(_statements))
                .then((_statements) => {
                    setStatements((prevStatements) => [...prevStatements, ..._statements]);
                });
        }

        return {
            items,
            last,
            totalElements,
        };
    };

    return (
        <div>
            <div className="p-3 pb-0">{pluralize('paper', totalPapers, true)} referring to this resource.</div>
            <hr />
            <ListPage label="papers" boxShadow={false} hideTitleBar renderListItem={renderListItem} fetchItems={fetchItems} disableSearch />
            <ComparisonPopup />
        </div>
    );
}

ResourceUsage.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ResourceUsage;
