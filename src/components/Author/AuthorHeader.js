import { useState } from 'react';
import { Button, Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid, faLinkedin, faGoogle, faResearchgate } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faEllipsisV, faGlobe, faSpinner, faPen } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import useAuthor from './hooks/useAuthor';

const AuthorHeader = ({ authorId }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const { author, isLoading, isFailedLoading, loadAuthorData } = useAuthor({
        authorId,
    });

    return (
        <>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
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
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={NavLink} end to={reverse(ROUTES.RESOURCE, { id: authorId })}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                    >
                        Author: {author.label}
                    </TitleBar>

                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={author.id}
                            label={author.label}
                            enableEdit={true}
                            syncBackend={true}
                            onCloseModal={() => loadAuthorData()}
                        />
                    )}
                    <Container className="p-0">
                        <div className="box rounded p-4 pb-2 mb-3">
                            <div className="row">
                                {author.orcid && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            ORCID <Icon color="#A6CE39" icon={faOrcid} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a href={`https://orcid.org/${author.orcid.label}`} target="_blank" rel="noopener noreferrer">
                                                {author.orcid.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.website && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Website <Icon icon={faGlobe} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a href={author.website.label} target="_blank" rel="noopener noreferrer">
                                                {author.website.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.googleScholar && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Google Scholar <Icon icon={faGoogle} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://scholar.google.com/citations?user=${author.googleScholar.label}=en&oi=ao`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.googleScholar.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.researchGate && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            ResearchGate <Icon icon={faResearchgate} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://www.researchgate.net/profile/${author.researchGate.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.researchGate.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {author.linkedIn && (
                                    <div className="col-md-3 col-sm-6">
                                        <div>
                                            Linkedin <Icon icon={faLinkedin} />
                                        </div>
                                        <div className="mb-3 text-wrap">
                                            <a
                                                href={`https://www.linkedin.com/in/${author.linkedIn.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.linkedIn.label} <Icon icon={faExternalLinkAlt} />
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

AuthorHeader.propTypes = {
    authorId: PropTypes.string.isRequired,
};

export default AuthorHeader;
