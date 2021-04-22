import { useCallback, useState } from 'react';
import { getPage } from 'services/cms';
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
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);

    const loadPage = useCallback(async ({ id, categoryTitle = undefined, categoryId = undefined }) => {
        setIsLoading(true);
        try {
            const _page = await getPage(id);
            setPage({
                ..._page,
                content: <Article dangerouslySetInnerHTML={{ __html: converter.makeHtml(_page.content) }} />
            });
            if (_page.category?.title !== categoryTitle && _page.category?.id !== categoryId) {
                throw new Error('Page category does not match selected category');
            }
        } catch (e) {
            console.log(e);
            setIsNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { page, isLoading, isNotFound, loadPage };
};

export default usePage;
