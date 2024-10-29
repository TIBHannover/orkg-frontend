import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Link from 'next/link';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC } from 'react';
import { Predicate } from 'services/backend/types';

type PredicateViewProps = {
    predicate: Predicate;
    isNewPredicate?: boolean;
};
const PredicateView: FC<PredicateViewProps> = ({ predicate, isNewPredicate = false }) => {
    const { config } = useDataBrowserState();

    return (
        <DescriptionTooltip id={predicate.id} _class={predicate._class}>
            <Link
                href={reverse(ROUTES.PROPERTY, { id: predicate.id })}
                target={!config.propertiesAsLinks ? '_blank' : '_self'}
                className={`${!config.propertiesAsLinks ? 'text-dark' : ''} ${isNewPredicate ? 'fst-italic fw-normal opacity-75' : ''}`}
                style={{ fontWeight: 500 }}
            >
                {predicate.label}
            </Link>
        </DescriptionTooltip>
    );
};

export default PredicateView;
