import qs from 'qs';

import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { getContributorInformationById } from '@/services/backend/contributors';
import { PaginatedResponse, TopContributor } from '@/services/backend/types';

export const statsUrl = `${url}stats/`;
export const statsApi = backendApi.extend(() => ({ prefixUrl: statsUrl }));

/**
 * Get top contributors
 * @param {String} researchFieldId Research field id
 * @param {Number} days Number of last days (by default it counts all time, from 2010-01-01)
 * @param {Number} page Page number (Doesn't not work!)
 * @param {Number} size Number of items per page
 * @param {String} sortBy Sort field
 * @param {Boolean} desc  ascending order and descending order.
 * @param {Boolean} subfields whether include the subfields or not
 * @return {Object} List of contributors
 */
export const getTopContributors = async ({
    researchFieldId = null,
    days = null,
    page = 0,
    size = 9999,
    sortBy = 'contributions',
    desc = true,
    subfields = true,
}: {
    researchFieldId?: string | null;
    days?: number | null;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    subfields?: boolean;
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const searchParams = qs.stringify(
        { page, size, sort, days },
        {
            skipNulls: true,
        },
    );
    let apiCall: PaginatedResponse<TopContributor>;
    if (researchFieldId) {
        apiCall = await statsApi
            .get<PaginatedResponse<TopContributor>>(`research-field/${researchFieldId}/${subfields ? 'subfields/' : ''}top/contributors`, {
                searchParams,
            })
            .json();
    } else {
        apiCall = await statsApi
            .get<PaginatedResponse<TopContributor>>(`top/contributors`, {
                searchParams,
            })
            .json();
    }

    const uniqContributorsInfosRequests = apiCall.content.map((c) => getContributorInformationById(c.contributor).catch(() => null));
    const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
    return {
        ...apiCall,
        content: apiCall.content
            .map((c) => ({ ...c, ...uniqContributorsInfos.filter((i) => i).find((i) => c.contributor === i?.id) }))
            .filter((u) => u.id),
    };
};
