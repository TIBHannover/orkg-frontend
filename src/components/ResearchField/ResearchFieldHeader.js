import { useState } from 'react';
import { Container, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { SubTitle } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import Contributors from 'components/TopContributors/Contributors';
import { NavLink, Link } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import { useSelector } from 'react-redux';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import CheckSlug from 'components/CheckSlug/CheckSlug';
import CheckClasses from 'components/CheckClasses/CheckClasses';
import { reverseWithSlug } from 'utils';
import { CLASSES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';

const ResearchFieldHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField();

    return (
        <>
            {!isLoading && !isFailedLoading && <CheckSlug label={researchFieldData.label} route={ROUTES.RESEARCH_FIELD} />}
            {!isLoading && !isFailedLoading && (
                <CheckClasses classes={researchFieldData.classes} targetClass={CLASSES.RESEARCH_FIELD} resourceId={researchFieldData.id} />
            )}
            {isLoading && (
                <>
                    <div className="mt-4 mb-4 container">
                        <ContentLoader
                            speed={2}
                            width={400}
                            height={20}
                            viewBox="0 0 400 20"
                            style={{ width: '100% !important' }}
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                        >
                            <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        </ContentLoader>
                    </div>
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                </>
            )}
            {!isLoading && !isFailedLoading && (
                <>
                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={id}
                            label={researchFieldData.label}
                            enableEdit={true}
                            syncBackend={true}
                            onCloseModal={() => loadResearchFieldData(id)}
                        />
                    )}
                    <TitleBar
                        titleAddition={<SubTitle>Research field</SubTitle>}
                        buttonGroup={
                            <>
                                {isCurationAllowed && (
                                    <RequireAuthentication
                                        component={Button}
                                        size="sm"
                                        color="secondary"
                                        className="float-end"
                                        onClick={() => setEditMode(v => !v)}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={NavLink} end to={reverse(ROUTES.RESOURCE, { id })}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                        wrap={false}
                    >
                        {researchFieldData.label}
                    </TitleBar>

                    <Container className="p-3 box rounded">
                        {(researchFieldData.description || researchFieldData.sameAs) && (
                            <>
                                {researchFieldData.description && (
                                    <>
                                        <h2 className="h5">Description</h2>
                                        {researchFieldData.description && <p className="m-0">{researchFieldData.description}</p>}
                                    </>
                                )}
                                {researchFieldData.sameAs && (
                                    <ExternalDescription
                                        query={researchFieldData.sameAs ? researchFieldData.sameAs.label : researchFieldData.label}
                                    />
                                )}

                                <hr className="my-3" />
                            </>
                        )}
                        {subResearchFields && subResearchFields.length > 0 && (
                            <>
                                <h2 className="h5">Subfields</h2>
                                <div>
                                    {subResearchFields.slice(0, 9).map(subfield => (
                                        <Link
                                            key={`index${subfield.id}`}
                                            to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                researchFieldId: subfield.id,
                                                slug: subfield.label
                                            })}
                                        >
                                            <Badge color="light" className="me-2 mb-2">
                                                {subfield.label}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {subResearchFields.length > 9 &&
                                        showMoreFields &&
                                        subResearchFields.slice(9).map(subfield => (
                                            <Link
                                                key={`index${subfield.id}`}
                                                to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                    researchFieldId: subfield.id,
                                                    slug: subfield.label
                                                })}
                                            >
                                                <Badge color="light" className="me-2 mb-2">
                                                    {subfield.label}
                                                </Badge>
                                            </Link>
                                        ))}
                                    {subResearchFields.length > 9 && (
                                        <Button onClick={() => setShowMoreFields(v => !v)} color="link" size="sm" className="p-0 ms-2">
                                            {showMoreFields ? 'Show less subfields' : 'Show more subfields'}
                                        </Button>
                                    )}
                                </div>

                                <hr className="my-3" />
                            </>
                        )}

                        <Contributors researchFieldId={id} />
                    </Container>
                </>
            )}
        </>
    );
};

ResearchFieldHeader.propTypes = {
    id: PropTypes.string.isRequired
};

export default ResearchFieldHeader;
