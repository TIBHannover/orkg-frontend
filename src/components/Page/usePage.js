import { useCallback, useState } from 'react';
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

    const loadPage = useCallback(async ({ pagePromise }) => {
        setIsLoading(true);
        try {
            const _page = await pagePromise;

            setPage({
                ..._page,
                content: <Article dangerouslySetInnerHTML={{ __html: converter.makeHtml(_page.content) }} />
            });
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
