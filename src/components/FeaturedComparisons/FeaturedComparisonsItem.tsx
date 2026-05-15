import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Chip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import { resolveFeaturedComparisonSolidIcon } from '@/components/FeaturedComparisons/featuredComparisonSolidIcons';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type FeaturedComparisonsItemProps = {
    icon: string;
    title: string;
    description: string;
    id: string;
    sourcesCount: number;
};

const FeaturedComparisonsItem: FC<FeaturedComparisonsItemProps> = ({ icon, title, description, id, sourcesCount }) => {
    const iconDefinition = resolveFeaturedComparisonSolidIcon(icon);

    return (
        <div className="w-full sm:w-1/2 px-2 mb-6">
            <Link href={reverse(ROUTES.COMPARISON, { comparisonId: id })} className="block no-underline text-foreground hover:no-underline">
                <Card className="cursor-pointer border bg-surface-secondary">
                    <Card.Content className="!p-2.5">
                        <div className="flex">
                            <div className="w-1/4 px-2 flex justify-center items-center text-[50px] text-secondary border-r border-[#d9d9d9]">
                                <FontAwesomeIcon icon={iconDefinition} />
                            </div>
                            <div className="w-3/4 px-2">
                                <h5 className="text-sm leading-6 text-foreground mb-[5px] font-semibold">{title}</h5>
                                <p className="text-[0.9rem] mb-[5px] line-clamp-3">{description}</p>
                                <Chip>{sourcesCount} sources</Chip>
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </Link>
        </div>
    );
};

export default FeaturedComparisonsItem;
