import qs from 'qs';

const DATA_BROWSER_ARTICLES = qs.stringify(
    {
        filters: {
            $or: [
                {
                    title: {
                        $containsi: 'tips',
                    },
                },
                {
                    title: {
                        $containsi: 'how to',
                    },
                },
            ],
        },
        sort: ['order'],
        help_category: 2,
    },
    {
        encodeValuesOnly: true, // prettify URL
    },
);

const HELP_CENTER_ARTICLES: {
    [key: string]: string;
} = {
    DATA_BROWSER_ARTICLES,
    RESOURCE_SHARED: '29',
    PREFERENCES: '28',
};
export default HELP_CENTER_ARTICLES;
