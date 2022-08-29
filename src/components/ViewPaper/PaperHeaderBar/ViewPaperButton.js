import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { getLinksByDoi, getLinksByTitle } from 'services/unpaywall';

const ViewPaperButton = ({ paperLink = null, doi = null, title = null }) => {
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const fetchLinks = async () => {
            setIsLoading(true);
            if (doi) {
                setLinks(await getLinksByDoi(doi));
            } else if (title) {
                setLinks(await getLinksByTitle(title));
            }
            setIsLoading(false);
            setHasLoaded(true);
        };
        if (isMenuOpen && !hasLoaded) {
            fetchLinks();
        }
    }, [doi, hasLoaded, isMenuOpen, title]);

    return (
        <ButtonDropdown isOpen={isMenuOpen} toggle={() => setIsMenuOpen(v => !v)}>
            <DropdownToggle style={{ marginRight: 2 }} size="sm" color="secondary" className="px-3 d-flex align-items-center">
                View paper <Icon icon={faSortDown} style={{ margin: '-4px 0 0 6px' }} />
            </DropdownToggle>
            <DropdownMenu>
                {paperLink && (
                    <DropdownItem tag="a" href={paperLink} target="_blank" rel="noopener noreferrer">
                        Visit paper
                    </DropdownItem>
                )}
                {isLoading && (
                    <DropdownItem disabled>
                        <ContentLoader height="80" width="200" viewBox="0 0 200 50" speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="0" ry="0" width="100%" height="20" />
                            <rect x="0" y="30" rx="0" ry="0" width="100%" height="20" />
                        </ContentLoader>
                    </DropdownItem>
                )}
                {!isLoading && links.length > 0 && (
                    <>
                        {paperLink && <DropdownItem divider />}
                        <DropdownItem tag="a" className="dropdown-header" href="https://unpaywall.org/" target="_blank" rel="noopener noreferrer">
                            Alternative sources by Unpaywall
                        </DropdownItem>
                        {links.map(link => (
                            <DropdownItem key={link.url} tag="a" href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.name}
                            </DropdownItem>
                        ))}
                    </>
                )}
                {!isLoading && links.length === 0 && !paperLink && <DropdownItem header>No links found</DropdownItem>}
            </DropdownMenu>
        </ButtonDropdown>
    );
};

ViewPaperButton.propTypes = {
    paperLink: PropTypes.string,
    doi: PropTypes.string,
    title: PropTypes.string,
};

export default ViewPaperButton;
