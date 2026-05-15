import 'swiper/css/effect-fade';

import { faCubes, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useState } from 'react';
import { Autoplay, EffectCube, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import useContributor from '@/components/hooks/useContributor';
import useObservatoryStats from '@/components/Observatory/hooks/useObservatoryStats';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { Observatory } from '@/services/backend/types';

const MemberAvatar = ({ userId }: { userId: string }) => {
    const { contributor, isLoadingContributor } = useContributor({ userId });
    const gravatarUrl = `https://gravatar.com/avatar/${contributor?.gravatarId ?? 'example@example.com'}?s=24&d=retro&r=g`;

    return (
        <Tooltip delay={0}>
            <Tooltip.Trigger aria-label={contributor?.displayName ?? 'Member'}>
                <Link href={reverse(ROUTES.USER_PROFILE, { userId })} className="relative z-0 transition-transform hover:z-10 hover:scale-110">
                    <Avatar className="size-6 cursor-pointer ring-2 ring-background">
                        {!isLoadingContributor && (
                            <>
                                <Avatar.Image alt={contributor?.displayName ?? 'Member'} src={gravatarUrl} />
                                <Avatar.Fallback>??</Avatar.Fallback>
                            </>
                        )}
                    </Avatar>
                </Link>
            </Tooltip.Trigger>
            <Tooltip.Content>{contributor?.displayName}</Tooltip.Content>
        </Tooltip>
    );
};

type ObservatoryItemProps = {
    observatory: Observatory;
};

const ObservatoryItem = ({ observatory }: ObservatoryItemProps) => {
    const { stats, isLoading: isLoadingStats } = useObservatoryStats({ id: observatory.id });
    const [optimizedLogo, setOptimizedLogo] = useState(true);

    return (
        <div className="flex grow flex-col gap-4 py-4">
            <div className="grow space-y-4">
                <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })} className="block truncate no-underline">
                    <span className="text-lg font-semibold text-accent">{observatory.name}</span>
                </Link>
                <div className="px-2">
                    <Link className="flex text-center" href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>
                        {observatory.organization_ids.length > 1 && (
                            <Swiper
                                spaceBetween={30}
                                effect="fade"
                                autoplay={{ delay: 3000 }}
                                loop
                                modules={[Autoplay, EffectFade, EffectCube]}
                                className="orkgSwiper"
                            >
                                {observatory.organization_ids.map((oId) => (
                                    <SwiperSlide key={`imageLogo${oId}`} className="bg-white text-center" style={{ height: '120px', width: '300px' }}>
                                        <Image
                                            className="object-contain p-2"
                                            src={getOrganizationLogoUrl(oId)}
                                            alt={`${oId} logo`}
                                            fill
                                            unoptimized={!optimizedLogo}
                                            onError={() => optimizedLogo && setOptimizedLogo(false)}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                        {observatory.organization_ids.length === 1 && (
                            <div className="relative block h-[120px] w-[300px] grow bg-white text-center">
                                <Image
                                    className="object-contain p-2 text-center"
                                    src={getOrganizationLogoUrl(observatory.organization_ids[0])}
                                    alt={`${observatory.organization_ids[0]} logo`}
                                    fill
                                    unoptimized={!optimizedLogo}
                                    onError={() => optimizedLogo && setOptimizedLogo(false)}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        )}
                    </Link>
                </div>
            </div>
            <div className="flex items-center justify-between text-muted">
                <small>
                    <FontAwesomeIcon icon={faCubes} className="mr-1" /> {!isLoadingStats && pluralize('comparison', stats.comparisons, true)}
                    <FontAwesomeIcon icon={faFile} className="mr-1 ml-2" />
                    {!isLoadingStats && pluralize('paper', stats.papers, true)}
                </small>
                <div className="flex -space-x-1.5 items-center">
                    {observatory.members.slice(0, 5).map((userId) => (
                        <MemberAvatar key={userId} userId={userId} />
                    ))}
                    {observatory.members.length > 5 && (
                        <Avatar className="size-6 ring-2 ring-background">
                            <Avatar.Fallback className="text-[10px]">+{observatory.members.length - 5}</Avatar.Fallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ObservatoryItem;
