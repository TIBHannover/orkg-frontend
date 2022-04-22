import CheckSlug from 'components/CheckSlug/CheckSlug';
import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';
import { Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavItem, Alert } from 'reactstrap';
import { getAboutPage, getAboutPagesMenu } from 'services/cms';
import { reverseWithSlug } from 'utils';

const About = () => {
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [isFailedLoadingMenu, setIsFailedLoadingMenu] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();
    const id = params.id ? parseInt(params.id) : null;

    // load page content
    useEffect(() => {
        const load = async () => {
            let aboutPageId = id;
            // if not page ID is specified, load the first page from the menu
            if (!id) {
                const _menuItems = await getAboutPagesMenu();
                aboutPageId = _menuItems[0].id;
            }
            if (!aboutPageId || aboutPageId === page?.id) {
                return;
            }
            const pagePromise = getAboutPage(aboutPageId);
            loadPage({ pagePromise });
        };
        load();
    }, [params, loadPage, menuItems, id, page]);

    // load menu items
    useEffect(() => {
        if (!page?.category?.id) {
            setMenuItems([]);
            return;
        }

        const getMenu = async () => {
            setIsLoadingMenu(true);
            try {
                setMenuItems(await getAboutPagesMenu(page?.category?.id));
            } catch (e) {
                console.log(e);
                setIsFailedLoadingMenu(true);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        getMenu();
    }, [page?.category?.id]);

    useEffect(() => {
        document.title = `${page?.title ?? ''} - ORKG`;
    }, [page]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && params?.id && page?.title && <CheckSlug label={page.title} route={ROUTES.ABOUT} />}

            {!isLoading && <TitleBar>{page?.category?.label ?? page?.title}</TitleBar>}

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {!isLoadingMenu && menuItems.length > 1 && (
                    <>
                        <Navbar color="white" expand="md" className="mb-3 p-0">
                            <Nav>
                                {menuItems.map(item => (
                                    <NavItem key={item.id} className={item.id === page?.id ? 'rounded bg-light' : ''}>
                                        <Link className="nav-link" to={reverseWithSlug(ROUTES.ABOUT, { id: item.id, slug: item.title })}>
                                            {item.title}
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
