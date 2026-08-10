import { useQueryState } from 'nuqs';

export type PublishedStatus = 'unpublished' | 'published' | 'all';

// 'all' must be an explicit value: nuqs removes the param when set to null and would
// fall back to the 'unpublished' default, so a nullable boolean can't express it
const usePublishedFilter = () => {
    const [publishedStatus, setPublishedStatus] = useQueryState<PublishedStatus>('published', {
        defaultValue: 'unpublished',
        parse: (value) => (value === 'published' || value === 'all' ? value : 'unpublished'),
    });

    const published = publishedStatus === 'all' ? undefined : publishedStatus === 'published';

    return { publishedStatus, setPublishedStatus, published };
};

export default usePublishedFilter;
