import usePage from 'components/Page/usePage';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavItem } from 'reactstrap';
import { getPages } from 'services/cms';

const About = () => {
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const { loadPage, page, isLoading, isNotFound } = usePage();
    const params = useParams();

    useEffect(() => {
        if (!params?.id) {
            return;
        }
        loadPage({ id: params.id, categoryTitle: 'about' });
    }, [params, loadPage]);

    useEffect(() => {
        // if the menu is loaded already, don't load it
        if (!page || menuItems.length > 0) {
            return;
        }

        const getMenu = async () => {
            if (page.category?.id === 1) {
                setIsLoadingMenu(true);
                const _pages = await getPages({ category: 1, sort: 'order' });
                setMenuItems(_pages);
                setIsLoadingMenu(false);
            }
        };

        getMenu();
    }, [page, menuItems]);

    if (isNotFound) {
        return <NotFound />;
    }

    if (page && page.slug !== params.slug && page.id === parseInt(params.id)) {
        return <Redirect to={{ pathname: reverse(ROUTES.ABOUT, { ...params, slug: page.slug }), state: { status: 301 } }} />;
    }

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">About ORKG</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {!isLoadingMenu && menuItems.length > 0 && (
                    <>
                        <Navbar color="white" expand="md" className="mb-3 p-0">
                            <Nav>
                                {menuItems.map(item => (
                                    <NavItem key={item.id} className={item.id === parseInt(params.id) ? 'rounded bg-light' : ''}>
                                        <Link className="nav-link" to={reverse(ROUTES.ABOUT, { id: item.id, slug: item.slug })}>
                                            {item.title}
                                        </Link>
                                    </NavItem>
                                ))}
                            </Nav>
                        </Navbar>
                        <hr />
                    </>
                )}

                {isLoading && 'Loading...'}

                {!isLoading && page?.content}
            </Container>
        </div>
    );
};

export default About;
