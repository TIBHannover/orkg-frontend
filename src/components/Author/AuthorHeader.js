import { useState, useEffect } from 'react';
import { Button, Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import useAuthor from './hooks/useAuthor';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid, faLinkedin, faGoogle, faResearchgate } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faEllipsisV, faGlobe, faSpinner, faPen } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { usePrevious } from 'react-use';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const AuthorMetaInfo = styled.div`
    border-left: 1px ${props => props.theme.secondary} solid;
    flex-basis: 0;
    flex-grow: 1;

    &:first-of-type {
        border-left: none;
    }
    .value {
        margin-bottom: 10px;
    }
`;

const AuthorHeader = ({ authorId }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const { author, isLoading, isFailedLoading, loadAuthorData } = useAuthor({
        authorId
    });

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadAuthorData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

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
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: authorId })}>
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
                        />
                    )}
                    <Container className="p-0">
                        <div className="box rounded p-4 mb-3">
                            <div className="d-flex">
                                {author.orcid && (
                                    <AuthorMetaInfo>
                                        <div className="key">
                                            ORCID <Icon color="#A6CE39" icon={faOrcid} />
                                        </div>
                                        <div className="value">
                                            <a href={`https://orcid.org/${author.orcid.label}`} target="_blank" rel="noopener noreferrer">
                                                {author.orcid.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.website && (
                                    <AuthorMetaInfo className="ps-3">
                                        <div className="key">
                                            Website <Icon icon={faGlobe} />
                                        </div>
                                        <div className="value">
                                            <a href={author.website.label} target="_blank" rel="noopener noreferrer">
                                                {author.website.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.googleScholar && (
                                    <AuthorMetaInfo className="ps-3">
                                        <div className="key">
                                            Google Scholar <Icon icon={faGoogle} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://scholar.google.com/citations?user=${author.googleScholar.label}=en&oi=ao`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.googleScholar.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.researchGate && (
                                    <AuthorMetaInfo className="ps-3">
                                        <div className="key">
                                            ResearchGate <Icon icon={faResearchgate} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://www.researchgate.net/profile/${author.researchGate.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.researchGate.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.linkedIn && (
                                    <AuthorMetaInfo className="ps-3">
                                        <div className="key">
                                            Linkedin <Icon icon={faLinkedin} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://www.linkedin.com/in/${author.linkedIn.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.linkedIn.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
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
    authorId: PropTypes.object.isRequired
};

export default AuthorHeader;
