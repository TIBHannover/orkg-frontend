import { faGoogle, faLinkedin, faOrcid, faResearchgate } from '@fortawesome/free-brands-svg-icons';
import { faEllipsisV, faExternalLinkAlt, faGlobe, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';

import NotFound from '@/app/not-found';
import useAuthor from '@/components/Author/hooks/useAuthor';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

type AuthorHeaderProps = {
    authorId: string;
};

const AuthorHeader: FC<AuthorHeaderProps> = ({ authorId }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const { author, isLoading, isFailedLoading, loadAuthorData } = useAuthor({
        authorId,
    });

    const [editMode, setEditMode] = useState(false);

    return (
        <>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <NotFound />}
            {!isLoading && author && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    className="float-end"
                                    onClick={() => setEditMode((v) => !v)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end="true">
                                        <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: authorId })}?noRedirect`}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
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
                    <Container className="p-0">
                        <div className="box rounded p-4 pb-2 mb-3">
                            <div className="row">
                                {author.orcid && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            ORCID <FontAwesomeIcon color="#A6CE39" icon={faOrcid} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a href={`https://orcid.org/${author.orcid.label}`} target="_blank" rel="noopener noreferrer">
                                                {author.orcid.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.website && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Website <FontAwesomeIcon icon={faGlobe} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a href={author.website.label} target="_blank" rel="noopener noreferrer">
                                                {author.website.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.googleScholar && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Google Scholar <FontAwesomeIcon icon={faGoogle} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://scholar.google.com/citations?user=${author.googleScholar.label}&=en&oi=ao`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.googleScholar.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.researchGate && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            ResearchGate <FontAwesomeIcon icon={faResearchgate} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://www.researchgate.net/profile/${author.researchGate.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.researchGate.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.linkedIn && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Linkedin <FontAwesomeIcon icon={faLinkedin} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://www.linkedin.com/in/${author.linkedIn.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.linkedIn.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.dblp && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>DBLP</div>
                                        <div className="mb-3 text-wrap">
                                            <a href={`https://dblp.org/pid/${author.dblp}`} target="_blank" rel="noopener noreferrer">
                                                {author.dblp} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Container>
                </>
            )}
        </>
    );
};

export default AuthorHeader;
