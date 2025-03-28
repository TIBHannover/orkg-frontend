import pluralize from 'pluralize';
import { FC, useState } from 'react';
import { Alert, Button } from 'reactstrap';

import CreateComparisonModal from '@/components/Comparison/ComparisonHeader/CreateComparisonModal/CreateComparisonModal';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';

type LiveComparisonHeaderProps = {
    contributionIds: string[];
};

const LiveComparisonHeader: FC<LiveComparisonHeaderProps> = ({ contributionIds }) => {
    const [isOpenCreateComparisonModal, setIsOpenCreateComparisonModal] = useState(false);

    return (
        <>
            <TitleBar
                buttonGroup={
                    <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenCreateComparisonModal(true)}>
                        Create comparison...
                    </Button>
                }
                titleAddition={contributionIds.length > 1 && <SubTitle>{pluralize('contribution', contributionIds.length, true)}</SubTitle>}
            >
                Comparison
            </TitleBar>
            <Alert color="info" fade={false} className="container box-shadow border-0">
                You are viewing a live comparison. To be able to make any changes to the comparison, you have to click the{' '}
                <em>Create comparison...</em> button first.
            </Alert>
            {isOpenCreateComparisonModal && (
                <CreateComparisonModal toggle={() => setIsOpenCreateComparisonModal((v) => !v)} contributionIds={contributionIds} />
            )}
        </>
    );
};

export default LiveComparisonHeader;
