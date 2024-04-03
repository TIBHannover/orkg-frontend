export type CmsResponsePaginated<T> = {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
};

export type CmsResponseSingle<T> = {
    data: T;
    meta: {};
};

export type HelpArticleSubData = {
    data: {
        id: string;
        attributes: {
            order: string;
            title: string;
        };
    }[];
};

export type HelpCategorySubData = {
    data: {
        id: number;
        attributes: {
            title: string;
        };
    };
};

export type HelpArticle = {
    id: number;
    data: HelpArticle[];
    category: {
        label: string;
    };
    attributes: {
        title: string;
        content: string;
        url: string;
        order: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string | null;
        category: {
            attrributes: { id: string; title: string };
            data: {
                id: null | undefined;
                attributes: {};
            };
        };
        help_category?: HelpCategorySubData;
        help_articles?: HelpArticleSubData;
        data: [
            {
                id: number;
                attributes: {
                    title: string;
                    content: string;
                    order: string;
                    createdAt: string;
                    updatedAt: string;
                    publishedAt: string | null;
                };
            },
        ];
    };
};

export type AboutPageCategory = {
    id: number;
    attributes: {
        label: string;
    };
};

export type GetHelpArticlesParams = {
    where: string;
};

export type HelpCategory = {
    id: number;
    attributes: {
        title: string;
        content: string;
        order: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string | null;
        help_articles: HelpArticleSubData;
    };
};

export type Alert = {
    id: string;
    attributes: { hideAfterDate: string; color: string; message: string };
};

export type NewsCard = {
    id: number;
    attributes: {
        title: string;
        message: string;
        updatedAt: string;
        publishedAt: string;
    };
};

export type Feedback = {
    id: number;
    attributes: {
        comments: string;
        options: string;
        type: string;
        inputData: {
            value: string;
        };
        outputData: {
            feedback: string;
        };
        llmTask: string;
        createdAt: string;
        updatedAt: string;
    };
};

export type FeedbackType = 'positive' | 'neutral' | 'negative';
