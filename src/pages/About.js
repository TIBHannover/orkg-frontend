import CheckSlug from 'components/CheckSlug/CheckSlug';
import PageContentLoader from 'components/Page/PageContentLoader';
import usePage from 'components/Page/usePage';
import ROUTES from 'constants/routes';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavItem, Alert } from 'reactstrap';
import { getAboutPage, getAboutPages } from 'services/cms';
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
        let aboutPageId = id;
        // if not page ID is specified, load the first page from the menu
        if (!id && menuItems.length > 0) {
            aboutPageId = menuItems[0].id;
        }
        if (!aboutPageId || aboutPageId === page?.id) {
            return;
        }
        const pagePromise = getAboutPage(aboutPageId);
        loadPage({ pagePromise });
    }, [params, loadPage, menuItems, id, page]);

    // load menu items
    useEffect(() => {
        // if the menu is loaded already, don't load it
        if (menuItems.length > 0) {
            return;
        }

        const getMenu = async () => {
            setIsLoadingMenu(true);
            try {
                const _pages = await getAboutPages();
                setMenuItems(_pages);
            } catch (e) {
                console.log(e);
                setIsFailedLoadingMenu(true);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        getMenu();
    }, [menuItems.length]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {!isLoading && params?.id && page?.title && <CheckSlug label={page.title} route={ROUTES.ABOUT} />}

            <Container>
                <h1 className="h4 mt-4 mb-4">About ORKG</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {!isLoadingMenu && menuItems.length > 0 && (
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

                {!isLoading && page?.content}
            </Container>
        </div>
    );
};

export default About;
