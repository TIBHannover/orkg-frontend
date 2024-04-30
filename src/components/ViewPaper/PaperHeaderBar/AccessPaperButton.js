import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { getLinksByDoi, getLinksByTitle } from 'services/unpaywall';

const AccessPaperButton = ({ paperLink = null, doi = null, title = null }) => {
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

    const tibLink = `https://www.tib.eu/de/suchen?tx_tibsearch_search%5Bquery%5D=${encodeURIComponent(
        doi ? `identifier:doi\\:${doi}` : `"${title}"`,
    )}`;

    return (
        <ButtonDropdown isOpen={isMenuOpen} toggle={() => setIsMenuOpen((v) => !v)}>
            <DropdownToggle style={{ marginRight: 2 }} size="sm" color="secondary" className="px-3 d-flex align-items-center">
                Access paper <Icon icon={faSortDown} style={{ margin: '-4px 0 0 6px' }} />
            </DropdownToggle>
            <DropdownMenu>
                {paperLink && (
                    <DropdownItem tag="a" href={paperLink} target="_blank" rel="noopener noreferrer">
                        Visit paper
                    </DropdownItem>
                )}
                <DropdownItem tag="a" href={tibLink} target="_blank" rel="noopener noreferrer">
                    View in TIB portal
                </DropdownItem>
                {isLoading && (
                    <DropdownItem disabled>
                        <ContentLoader height="80" width="200" viewBox="0 0 200 50" speed={2}>
                            <rect x="0" y="0" rx="0" ry="0" width="100%" height="20" />
                            <rect x="0" y="30" rx="0" ry="0" width="100%" height="20" />
                        </ContentLoader>
                    </DropdownItem>
                )}
                {!isLoading && links.length > 0 && (
                    <>
                        {paperLink && <DropdownItem divider />}
                        <Tippy content="Results can be incomplete or incorrect (especially if no DOI is available for this paper)">
                            <span>
                                <DropdownItem
                                    tag="a"
                                    className="dropdown-header"
                                    href="https://unpaywall.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Alternative sources by Unpaywall
                                </DropdownItem>
                            </span>
                        </Tippy>
                        {links.map((link, index) => (
                            <DropdownItem key={index} tag="a" href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.name}
                            </DropdownItem>
                        ))}
                    </>
                )}
            </DropdownMenu>
        </ButtonDropdown>
    );
};

AccessPaperButton.propTypes = {
    paperLink: PropTypes.string,
    doi: PropTypes.string,
    title: PropTypes.string,
};

export default AccessPaperButton;
