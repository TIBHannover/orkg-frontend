'use client';

import NotFound from 'app/not-found';
import CheckSlug from 'components/CheckSlug/CheckSlug';
import Link from 'components/NextJsMigration/Link';
import useParams from 'components/NextJsMigration/useParams';
import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import TitleBar from 'components/TitleBar/TitleBar';
import { CmsPage } from 'components/styled';
import ROUTES from 'constants/routes';
import { useEffect, useState } from 'react';
import { Alert, Container, Nav, NavItem, Navbar } from 'reactstrap';
import { getAboutPage, getAboutPages } from 'services/cms';
import { HelpArticle } from 'services/cms/types';
import { reverseWithSlug } from 'utils';

const About = () => {
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [isFailedLoadingMenu, setIsFailedLoadingMenu] = useState(false);
    const [menuItems, setMenuItems] = useState<HelpArticle[]>([]);
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();
    const id = parseInt(params.id.toString(), 10);

    // load page content
    useEffect(() => {
        const load = async () => {
            if (id === page?.id) {
                return;
            }
            const pagePromise = getAboutPage(id);
            loadPage({ pagePromise });
        };
        load();
    }, [params, loadPage, menuItems, id, page]);

    // load menu items
    useEffect(() => {
        if (!page?.attributes?.category?.data?.id) {
            setMenuItems([]);
            return;
        }

        const getMenu = async () => {
            setIsLoadingMenu(true);
            try {
                setMenuItems((await getAboutPages(page?.attributes?.category?.data?.id)).data);
            } catch (e) {
                console.error(e);
                setIsFailedLoadingMenu(true);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        getMenu();
    }, [page]);

    useEffect(() => {
        document.title = `${page?.attributes?.title ?? ''} - ORKG`;
    }, [page]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && params?.id && page?.attributes?.title && <CheckSlug label={page.attributes.title} route={ROUTES.ABOUT} />}
            {!isLoading && <TitleBar>{page?.category?.label ?? page?.attributes?.title}</TitleBar>}
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!isLoadingMenu && menuItems.length > 1 && (
                    <>
                        <Navbar color="white" expand="md" className="mb-3 p-0">
                            <Nav>
                                {menuItems.map((item) => (
                                    <NavItem key={item.id} className={item.id === page?.id ? 'rounded bg-light' : ''}>
                                        {/* @ts-expect-error */}
                                        <Link
                                            className="nav-link"
                                            href={reverseWithSlug(ROUTES.ABOUT, { id: item.id, slug: item.attributes?.title })}
                                        >
                                            {item.attributes?.title}
                                        </Link>
                                    </NavItem>
                                ))}
                            </Nav>
                        </Navbar>
                        <hr />
                    </>
                )}

                {!isLoadingMenu && isFailedLoadingMenu && <Alert color="danger">Failed loading menu</Alert>}

                {isLoading && <PageContentLoader />}

                <CmsPage>{!isLoading && page?.content}</CmsPage>
            </Container>
        </div>
    );
};

export default About;
