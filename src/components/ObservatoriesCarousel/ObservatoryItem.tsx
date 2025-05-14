import 'swiper/css/effect-fade';

import { faCubes, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Image from 'next/image';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useState } from 'react';
import { CardTitle } from 'reactstrap';
import { Autoplay, EffectCube, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import useObservatoryStats from '@/components/Observatory/hooks/useObservatoryStats';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { Observatory } from '@/services/backend/types';

type ObservatoryItemProps = {
    observatory: Observatory;
};

const ObservatoryItem = ({ observatory }: ObservatoryItemProps) => {
    const { stats, isLoading: isLoadingStats } = useObservatoryStats({ id: observatory.id });
    const [optimizedLogo, setOptimizedLogo] = useState(true);
    return (
        <div className="d-flex flex-column flex-grow-1 mb-4">
            <div className="flex-grow-1 mb-2">
                <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })} style={{ textDecoration: 'none' }}>
                    <CardTitle tag="h5" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {observatory.name}
                    </CardTitle>
                </Link>
                <div className="my-3 px-2">
                    <Link className="text-center d-flex" href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>
                        <Swiper
                            spaceBetween={30}
                            effect="fade"
                            autoplay={{
                                delay: 3000,
                            }}
                            loop
                            modules={[Autoplay, EffectFade, EffectCube]}
                            className="orkgSwiper"
                        >
                            {observatory.organization_ids.map((oId) => (
                                <SwiperSlide key={`imageLogo${oId}`} className="text-center bg-white" style={{ height: '120px', width: '300px' }}>
                                    <Image
                                        className="p-2"
                                        src={getOrganizationLogoUrl(oId)}
                                        alt={`${oId} logo`}
                                        fill
                                        objectFit="contain"
                                        unoptimized={!optimizedLogo}
                                        onError={() => optimizedLogo && setOptimizedLogo(false)}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Link>
                </div>
            </div>
            <div className="text-muted">
                <small>
                    <FontAwesomeIcon icon={faCubes} className="me-1" /> {!isLoadingStats && pluralize('comparison', stats.comparisons, true)}
                    <FontAwesomeIcon icon={faFile} className="me-1 ms-2" />
                    {!isLoadingStats && pluralize('paper', stats.papers, true)}
                </small>
                <div className="float-end" style={{ height: '25px' }}>
                    {observatory.members.slice(0, 5).map((contributor) => (
                        <UserAvatar key={contributor} userId={contributor} size={24} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ObservatoryItem;
