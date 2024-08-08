import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddStatement from 'components/RosettaStone/AddStatement/AddStatement';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { CERTAINTY, VISIBILITY } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { EXTRACTION_METHODS } from 'constants/misc';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { getStatements, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { RosettaStoneStatement } from 'services/backend/types';
import { RootStore } from 'slices/types';
import useSWR from 'swr';
import { guid } from 'utils';

type RosettaStoneStatementsProps = { context: string };

const RosettaStoneStatements: FC<RosettaStoneStatementsProps> = ({ context }) => {
    const [newStatements, setNewStatements] = useState<RosettaStoneStatement[]>([]);
    const { isEditMode } = useIsEditMode();
    const user = useSelector((state: RootStore) => state.auth.user);

    const {
        data: statements,
        isLoading,
        mutate,
    } = useSWR(context ? [{ context }, rosettaStoneUrl, 'getStatements'] : null, ([params]) => getStatements(params));

    const allStatements = [...(statements?.content ?? []), ...newStatements];

    const handleAddStatement = async (templateId: string) => {
        setNewStatements((prev) => [
            ...prev,
            {
                id: guid(),
                template_id: templateId,
                latest_version_id: undefined,
                is_latest_version: true,
                context: context as string,
                subjects: [],
                objects: [],
                created_at: new Date().toString(),
                created_by: ((user && 'id' in user && user?.id) as string) ?? MISC.UNKNOWN_ID,
                certainty: CERTAINTY.MODERATE,
                negated: false,
                observatories: user && 'observatory_id' in user && user.observatory_id ? [user.observatory_id] : [],
                organizations: user && 'organization_id' in user && user.organization_id ? [user.organization_id] : [],
                extraction_method: EXTRACTION_METHODS.MANUAL,
                visibility: VISIBILITY.DEFAULT,
                unlisted_by: undefined,
                modifiable: true,
            },
        ]);
    };

    return (
        <div>
            <div className="text-end mb-1">
                <Link target="_blank" className="btn btn-sm btn-outline-secondary" href="https://orkg.org/help-center/article/59/Statements">
                    <Icon className="me-1" icon={faQuestionCircle} /> Help
                </Link>
            </div>
            {isLoading && 'Loading...'}

            {!isLoading && (
                <ListGroup tag="div" className="mb-2">
                    {context &&
                        allStatements.map((s) => (
                            <SingleStatement key={s.id} statement={s} setNewStatements={setNewStatements} reloadStatements={mutate} />
                        ))}
                </ListGroup>
            )}

            {!isLoading && allStatements.length === 0 && (
                <ListGroup tag="div" className="mb-2">
                    <ListGroupItem className="mb-0 rounded">
                        No data yet
                        <br />
                        {isEditMode ? (
                            <span style={{ fontSize: '0.875rem' }}>Start by adding a statements from below</span>
                        ) : (
                            <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
                        )}
                        <br />
                    </ListGroupItem>
                </ListGroup>
            )}

            {isEditMode && <AddStatement handleAddStatement={handleAddStatement} />}
        </div>
    );
};

export default RosettaStoneStatements;
