import { isArray } from 'lodash';
import { ReactElement, useCallback, useState } from 'react';
import { CmsResponsePaginated, CmsResponseSingle, HelpArticle } from 'services/cms/types';
import * as Showdown from 'showdown';
import styled from 'styled-components';

const converter = new Showdown.Converter();
converter.setFlavor('github');

const Article = styled.div`
    h1 {
        font-size: 1.5rem;
    }
    h2 {
        font-size: 1.4rem;
    }
    h3 {
        font-size: 1.3rem;
    }
    h4 {
        font-size: 1.2rem;
    }
    h5 {
        font-size: 1.1rem;
    }
    h6 {
        font-size: 1.05rem;
    }
`;

const usePage = () => {
    const [page, setPage] = useState<HelpArticle & { content: ReactElement }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isNotFound, setIsNotFound] = useState<boolean>(false);

    const loadPage = useCallback(
        async ({ pagePromise }: { pagePromise: Promise<CmsResponsePaginated<HelpArticle> | CmsResponseSingle<HelpArticle>> }) => {
            setIsLoading(true);
            setIsNotFound(false);

            try {
                const _page = await pagePromise;
                const data: HelpArticle = isArray(_page.data)
                    ? (_page as CmsResponsePaginated<HelpArticle>).data[0]
                    : (_page as CmsResponseSingle<HelpArticle>).data;

                setPage({
                    ...data,
                    content: <Article dangerouslySetInnerHTML={{ __html: converter.makeHtml(data.attributes.content) }} />,
                });
            } catch (e) {
                console.log(e);
                setIsNotFound(true);
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    return { page, isLoading, isNotFound, loadPage };
};

export default usePage;
