import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { AnchorHTMLAttributes, FC, useState } from 'react';

import { OptionType } from '@/components/Autocomplete/types';
import useAuthentication from '@/components/hooks/useAuthentication';
import useMembership from '@/components/hooks/useMembership';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import AddStatement from '@/components/RosettaStone/AddStatement/AddStatement';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CERTAINTY, VISIBILITY } from '@/constants/contentTypes';
import { MISC } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { getRSStatements, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { RosettaStoneStatement } from '@/services/backend/types';
import { guid } from '@/utils';

type RosettaStoneStatementsProps = { context: string };

const RosettaStoneStatements: FC<RosettaStoneStatementsProps> = ({ context }) => {
    const [newStatements, setNewStatements] = useState<RosettaStoneStatement[]>([]);
    const { isEditMode } = useIsEditMode();
    const { user } = useAuthentication();
    const { organizationId, observatoryId } = useMembership();

    const {
        data: statements,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
        mutate,
    } = usePaginate({
        defaultPageSize: 10,
        fetchFunction: getRSStatements,
        fetchUrl: rosettaStoneUrl,
        fetchFunctionName: 'getRSStatements',
        fetchExtraParams: {
            context,
        },
    });

    const allStatements = [...(statements ?? []), ...newStatements];

    const handleAddStatement = async (templateId: string, subjects: OptionType[] = []) => {
        setNewStatements((prev) => [
            ...prev,
            {
                id: guid(),
                template_id: templateId,
                latest_version_id: undefined,
                is_latest_version: true,
                context: context as string,
                subjects,
                objects: [],
                created_at: new Date().toString(),
                created_by: ((user && 'id' in user && user?.id) as string) ?? MISC.UNKNOWN_ID,
                certainty: CERTAINTY.MODERATE,
                negated: false,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                extraction_method: EXTRACTION_METHODS.MANUAL,
                visibility: VISIBILITY.DEFAULT,
                unlisted_by: undefined,
                modifiable: true,
            },
        ]);
    };

    const renderListItem = (s: RosettaStoneStatement) => (
        <SingleStatement
            key={s.id}
            statement={s}
            setNewStatements={setNewStatements}
            reloadStatements={mutate}
            handleAddStatement={handleAddStatement}
        />
    );

    return (
        <div>
            <div className="text-right mb-1 px-4">
                <Button
                    size="sm"
                    variant="outline"
                    className="button--orkg-secondary"
                    render={(props) => (
                        <Link
                            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                            href="https://orkg.org/help-center/article/59/Statements"
                            target="_blank"
                        />
                    )}
                >
                    <FontAwesomeIcon icon={faQuestionCircle} /> Help
                </Button>
            </div>
            <ListPaginatedContent<RosettaStoneStatement>
                renderListItem={renderListItem}
                pageSize={pageSize}
                label="statements"
                isLoading={isLoading}
                items={allStatements ?? []}
                hasNextPage={hasNextPage}
                page={page}
                setPage={setPage}
                setPageSize={setPageSize}
                totalElements={totalElements}
                error={error}
                totalPages={totalPages}
                boxShadow={false}
                flush={false}
                noDataComponent={
                    <div className="rounded border border-border bg-surface p-4 mb-2 text-center">
                        No data yet
                        <br />
                        <span className="text-sm">{isEditMode ? 'Start by adding a statements from below' : 'Please contribute by editing'}</span>
                    </div>
                }
            />
            {isEditMode && (
                <div className="mt-2 px-4">
                    <AddStatement handleAddStatement={handleAddStatement} context={context} />
                </div>
            )}
        </div>
    );
};

export default RosettaStoneStatements;
