import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ObservatoriesCarousel from '@/components/ObservatoriesCarousel/ObservatoriesCarousel';
import useResearchFieldObservatories from '@/components/ResearchField/hooks/useResearchFieldObservatories';
import ROUTES from '@/constants/routes';

type ObservatoriesBoxProps = {
    researchFieldId: string;
};
const ObservatoriesBox: FC<ObservatoriesBoxProps> = ({ researchFieldId }) => {
    const { observatories, isLoading } = useResearchFieldObservatories({ researchFieldId });

    return (
        <div className="box rounded-3" style={{ overflow: 'hidden' }}>
            <h2
                className="h5"
                style={{
                    marginBottom: 0,
                    padding: '15px',
                }}
            >
                <Tooltip
                    contentStyle={{ maxWidth: '300px' }}
                    content="Observatories organize research contributions in a particular research field and are curated by research organizations active in the respective field."
                >
                    <span>Observatories</span>
                </Tooltip>
                <Link href={ROUTES.OBSERVATORIES}>
                    <span style={{ fontSize: '0.9rem', float: 'right', marginTop: 2, marginBottom: 15 }}>More observatories</span>
                </Link>
            </h2>
            <hr className="mx-3 mt-0" />
            <ObservatoriesCarousel observatories={observatories} isLoading={isLoading} />
        </div>
    );
};

export default ObservatoriesBox;
