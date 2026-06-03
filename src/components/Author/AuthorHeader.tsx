import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGoogle, faLinkedin, faOrcid, faResearchgate } from '@fortawesome/free-brands-svg-icons';
import { faEllipsisV, faExternalLinkAlt, faGlobe, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Skeleton } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

import NotFound from '@/app/not-found';
import useAuthor from '@/components/Author/hooks/useAuthor';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type AuthorHeaderProps = {
    authorId: string;
};

type SocialLinkProps = {
    label: string;
    icon: IconDefinition;
    iconColor?: string;
    href: string;
    value: ReactNode;
};

const SocialLink: FC<SocialLinkProps> = ({ label, icon, iconColor, href, value }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary hover:bg-primary/5"
    >
        <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-base dark:bg-secondary-800/60"
            aria-hidden
        >
            <FontAwesomeIcon icon={icon} color={iconColor} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-medium text-muted">{label}</span>
            <span className="truncate text-sm text-foreground group-hover:text-primary">{value}</span>
        </span>
        <FontAwesomeIcon icon={faExternalLinkAlt} className="mt-1 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
);

const AuthorHeader: FC<AuthorHeaderProps> = ({ authorId }) => {
    const { author, isLoading, isFailedLoading, loadAuthorData } = useAuthor({ authorId });
    const [editMode, setEditMode] = useState(false);

    if (isLoading) {
        return (
            <>
                <div className="flex flex-wrap items-center gap-3 mt-6 mb-6 max-sm:mt-4">
                    <Skeleton className="h-7 w-48 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <div className="ml-auto flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-1 p-4 mb-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Skeleton key={i} className="h-14 rounded-lg" />
                        ))}
                    </div>
                </div>
            </>
        );
    }

    if (isFailedLoading) {
        return <NotFound />;
    }

    if (!author) {
        return null;
    }

    const socials: SocialLinkProps[] = [];
    if (author.orcid) {
        socials.push({
            label: 'ORCID',
            icon: faOrcid,
            iconColor: '#A6CE39',
            href: `https://orcid.org/${author.orcid.label}`,
            value: author.orcid.label,
        });
    }
    if (author.website) {
        socials.push({
            label: 'Website',
            icon: faGlobe,
            href: author.website.label,
            value: author.website.label,
        });
    }
    if (author.googleScholar) {
        socials.push({
            label: 'Google Scholar',
            icon: faGoogle,
            href: `https://scholar.google.com/citations?user=${author.googleScholar.label}&=en&oi=ao`,
            value: author.googleScholar.label,
        });
    }
    if (author.researchGate) {
        socials.push({
            label: 'ResearchGate',
            icon: faResearchgate,
            href: `https://www.researchgate.net/profile/${author.researchGate.label}`,
            value: author.researchGate.label,
        });
    }
    if (author.linkedIn) {
        socials.push({
            label: 'LinkedIn',
            icon: faLinkedin,
            href: `https://www.linkedin.com/in/${author.linkedIn.label}`,
            value: author.linkedIn.label,
        });
    }
    if (author.dblp) {
        socials.push({
            label: 'DBLP',
            icon: faExternalLinkAlt,
            href: `https://dblp.org/pid/${author.dblp}`,
            value: author.dblp,
        });
    }

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" onClick={() => setEditMode((v) => !v)}>
                            <FontAwesomeIcon icon={faPen} /> Edit
                        </RequireAuthentication>
                        <Dropdown>
                            <Button size="sm" className="button--orkg-secondary" isIconOnly aria-label="More options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu>
                                    <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id: authorId })}?noRedirect`} textValue="View resource">
                                        View resource
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </>
                }
                titleAddition="Author"
            >
                {author.label}
            </TitleBar>

            {editMode && (
                <DataBrowserDialog
                    isEditMode
                    show={editMode}
                    toggleModal={() => setEditMode((v) => !v)}
                    id={author.id}
                    label={author.label}
                    onCloseModal={() => loadAuthorData()}
                />
            )}

            {socials.length > 0 && (
                <div className="box rounded p-4 mb-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {socials.map((s) => (
                            <SocialLink key={s.label} {...s} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthorHeader;
