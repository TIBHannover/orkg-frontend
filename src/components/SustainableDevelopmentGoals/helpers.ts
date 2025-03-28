import { sortBy } from 'lodash';

import SDG_1 from '@/assets/img/sdgs/SDG_1.svg';
import SDG_2 from '@/assets/img/sdgs/SDG_2.svg';
import SDG_3 from '@/assets/img/sdgs/SDG_3.svg';
import SDG_4 from '@/assets/img/sdgs/SDG_4.svg';
import SDG_5 from '@/assets/img/sdgs/SDG_5.svg';
import SDG_6 from '@/assets/img/sdgs/SDG_6.svg';
import SDG_7 from '@/assets/img/sdgs/SDG_7.svg';
import SDG_8 from '@/assets/img/sdgs/SDG_8.svg';
import SDG_9 from '@/assets/img/sdgs/SDG_9.svg';
import SDG_10 from '@/assets/img/sdgs/SDG_10.svg';
import SDG_11 from '@/assets/img/sdgs/SDG_11.svg';
import SDG_12 from '@/assets/img/sdgs/SDG_12.svg';
import SDG_13 from '@/assets/img/sdgs/SDG_13.svg';
import SDG_14 from '@/assets/img/sdgs/SDG_14.svg';
import SDG_15 from '@/assets/img/sdgs/SDG_15.svg';
import SDG_16 from '@/assets/img/sdgs/SDG_16.svg';
import SDG_17 from '@/assets/img/sdgs/SDG_17.svg';
import { Node } from '@/services/backend/types';

export const getSdgNumber = (id: string) => parseInt(id.replace('SDG_', ''), 10);

export const sortSdgs = (items: Node[]) => sortBy(items, (item) => getSdgNumber(item.id));

export const getImage = (id: string) => {
    const sdgMap: { [id: string]: any } = {
        SDG_1,
        SDG_2,
        SDG_3,
        SDG_4,
        SDG_5,
        SDG_6,
        SDG_7,
        SDG_8,
        SDG_9,
        SDG_10,
        SDG_11,
        SDG_12,
        SDG_13,
        SDG_14,
        SDG_15,
        SDG_16,
        SDG_17,
    };

    const value = sdgMap[id] || '';
    return value;
};
