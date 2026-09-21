import { PathsApi } from '@orkg/orkg-client';

import { CLASSES } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';
import { getPaper } from '@/services/backend/papers';
import { Thing } from '@/services/backend/things';
import { PaginationParams, Resource } from '@/services/backend/types';

export const pathsUrl = `${urlNoTrailingSlash}/things`;

const pathsApi = new PathsApi(configuration);

// suits the open-ended "papers that reference this resource" question; callers asking something
// narrower pass their own, since extra hops pull in papers linked by an unrelated route
export const DEFAULT_PAPER_PATH_MAX_HOPS = 8;

// GET /api/papers dropped its linked_to filter; the inverse-paths endpoint answers the same
// question and groups by the furthest thing, so each row is one paper carrying all of its paths.
export const getPapersLinkedToResource = async ({
    id,
    page = 0,
    size = 9999,
    maxHops = DEFAULT_PAPER_PATH_MAX_HOPS,
}: { id: string; maxHops?: number } & PaginationParams) => {
    const result = await pathsApi.findAllByRootIdInverse({
        id,
        direction: 'INCOMING',
        maxHops,
        terminationClasses: [CLASSES.PAPER],
        page,
        size,
    });
    const content = result.content.flatMap((paths) => {
        const [paper] = paths[0] ?? [];
        // a group can terminate on a non-paper thing when the traversal is cut off at maxHops
        if (paper?._class !== 'resource' || !paper.classes?.includes(CLASSES.PAPER)) {
            return [];
        }
        return [{ ...paper, path: paths }] as (Resource & { path: Thing[][] })[];
    });
    return { ...result, content };
};

// The paths endpoint returns graph things, which lack the metadata a paper card renders, so each
// row needs a second fetch. Both tabs listing linked papers want this, hence it lives here.
export const getLinkedPapersWithPaths = async (params: { id: string; maxHops?: number } & PaginationParams) => {
    const result = await getPapersLinkedToResource(params);
    // isolate per-paper failures (e.g. a paper deleted between the two calls) so one
    // rejection doesn't blank the whole page
    const papers = await Promise.all(result.content.map((p) => getPaper(p.id).catch(() => null)));
    return {
        ...result,
        content: papers.flatMap((paper, i) => (paper ? [{ ...paper, path: result.content[i].path }] : [])),
    };
};
