import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Skeleton } from '@heroui/react';
import { FC, useEffect, useState } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { getLinksByDoi, getLinksByTitle } from '@/services/unpaywall';

type AccessPaperButtonProps = {
    paperLink?: string | null;
    doi?: string | null;
    title?: string | null;
};

const AccessPaperButton: FC<AccessPaperButtonProps> = ({ paperLink = null, doi = null, title = null }) => {
    const [links, setLinks] = useState<{ url: string; name: string }[]>([]);
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

    const staticItems: { key: string; label: string; href: string }[] = [];
    if (paperLink) {
        staticItems.push({ key: 'visit-paper', label: 'Visit paper', href: paperLink });
    }
    staticItems.push({ key: 'tib-portal', label: 'View in TIB portal', href: tibLink });

    const linkItems = links.map((link, index) => ({
        key: `unpaywall-${index}`,
        label: link.name,
        href: link.url,
    }));

    return (
        <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Button size="sm" className="button--orkg-secondary shrink-0">
                Access paper <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem] ml-1" />
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu>
                    <Dropdown.Section>
                        {staticItems.map((item) => (
                            <Dropdown.Item key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" textValue={item.label}>
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Section>
                    {isLoading ? (
                        <Dropdown.Section>
                            <Dropdown.Item key="loading" isDisabled textValue="Loading">
                                <div className="flex flex-col gap-2 w-full">
                                    <Skeleton className="w-full h-5 rounded" />
                                    <Skeleton className="w-full h-5 rounded" />
                                </div>
                            </Dropdown.Item>
                        </Dropdown.Section>
                    ) : (
                        <Dropdown.Section>
                            {linkItems.length > 0 && (
                                <>
                                    <Dropdown.Item
                                        key="unpaywall-header"
                                        href="https://unpaywall.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        textValue="Alternative sources by Unpaywall"
                                    >
                                        <Tooltip
                                            contentStyle={{ maxWidth: '300px' }}
                                            content="Results can be incomplete or incorrect (especially if no DOI is available for this paper)"
                                        >
                                            <span>Alternative sources by Unpaywall</span>
                                        </Tooltip>
                                    </Dropdown.Item>
                                    {linkItems.map((item) => (
                                        <Dropdown.Item
                                            key={item.key}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            textValue={item.label}
                                        >
                                            {item.label}
                                        </Dropdown.Item>
                                    ))}
                                </>
                            )}
                        </Dropdown.Section>
                    )}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default AccessPaperButton;
