import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { ContentType } from '@/services/backend/types';

type CoinsProps = {
    item: Partial<ContentType> & { _class?: string };
    genre?: 'issue' | 'article' | 'proceeding' | 'conference' | 'preprint' | 'unknown';
};

// Implementation of Coins (ContextObjects in Spans)
// Specification: https://web.archive.org/web/20161130184729/http://ocoins.info/cobg.html

const Coins: FC<CoinsProps> = ({ item, genre = 'article' }) => {
    const getCoinsData = () => {
        if (!item) {
            return '';
        }
        let title = '';
        if ('title' in item) {
            title = item.title ?? '';
        } else if ('label' in item) {
            title = item.label ?? '';
        }
        let date = '';
        if ('publication_info' in item) {
            date = item.publication_info?.published_year?.toString() ?? '';
        } else if ('created_at' in item) {
            date = item.created_at ?? '';
        }
        const coinsData: Record<string, string | number | undefined | string[]> = {
            'rft.genre': genre,
            ctx_ver: 'Z39.88-2004',
            rft_val_fmt: 'info:ofi/fmt:kev:mtx:journal',
            'rft.atitle': title,
            'rft.date': date,
            ...('identifiers' in item && item.identifiers && 'doi' in item.identifiers && item.identifiers.doi?.[0]
                ? { rft_id: `info:doi/${item.identifiers.doi[0]}` }
                : { rft_id: `${env('NEXT_PUBLIC_URL')}${reverse(ROUTES.RESOURCE, { id: item.id })}` }),
            rfr_id: 'info:sid/orkg.org:orkg',
        };

        // Add authors as an array
        if ('authors' in item && item.authors?.length) {
            coinsData['rft.au'] = item.authors.map((author) => author.name);
        }

        return Object.entries(coinsData)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
                }
                return `${encodeURIComponent(key)}=${encodeURIComponent(value?.toString() ?? '')}`;
            })
            .join('&');
    };

    return <span className="Z3988" title={getCoinsData()} />;
};

export default Coins;
