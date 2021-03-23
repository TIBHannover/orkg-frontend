import { useState, useEffect } from 'react';
import {
    Container,
    Button,
    ButtonGroup,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    CardTitle,
    Badge
} from 'reactstrap';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import Contributors from 'components/TopContributors/Contributors';
import { NavLink } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import CheckSlug from 'components/CheckSlug/CheckSlug';
import CheckClasses from 'components/CheckClasses/CheckClasses';
import { reverseWithSlug } from 'utils';
import { CLASSES } from 'constants/graphSettings';

const ResearchFieldHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField();
    const prevEditMode = usePrevious({ editMode });
    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResearchFieldData(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

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
                        <div className="text-left">
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
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <h1 className="h5 flex-shrink-0 mb-0">Research field</h1>
                        <>
                            <SubtitleSeparator />
                            <SubTitle className="h5 mb-0"> {researchFieldData.label}</SubTitle>
                        </>
                        {editMode && (
                            <StatementBrowserDialog
                                show={editMode}
                                toggleModal={() => setEditMode(v => !v)}
                                id={id}
                                label={researchFieldData.label}
                                enableEdit={true}
                                syncBackend={true}
                            />
                        )}
                        <ButtonGroup className="flex-shrink-0" style={{ marginLeft: 'auto' }}>
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                color="darkblue"
                                className="float-right"
                                onClick={() => setEditMode(v => !v)}
                            >
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                                <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </ButtonGroup>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <CardTitle tag="h5">Description</CardTitle>
                                {researchFieldData.description && <p className="m-0">{researchFieldData.description}</p>}
                                {!researchFieldData.description && <p className="m-0">No description for this research field yet!</p>}
                                {researchFieldData.sameAs && (
                                    <ExternalDescription
                                        query={researchFieldData.sameAs ? researchFieldData.sameAs.label : researchFieldData.label}
                                    />
                                )}
                            </CardBody>

                            {subResearchFields && subResearchFields.length > 0 && (
                                <>
                                    <hr className="m-0" />
                                    <CardBody>
                                        <CardTitle tag="h5">Subfields</CardTitle>
                                        <div>
                                            {subResearchFields.slice(0, 9).map(subfield => (
                                                <Link
                                                    key={`index${subfield.id}`}
                                                    to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                        researchFieldId: subfield.id,
                                                        slug: subfield.label
                                                    })}
                                                >
                                                    <Badge color="lightblue" className="mr-2 mb-2">
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
                                                        <Badge color="lightblue" className="mr-2 mb-2">
                                                            {subfield.label}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            {subResearchFields.length > 9 && (
                                                <Button onClick={() => setShowMoreFields(v => !v)} color="link" size="sm">
                                                    {showMoreFields ? 'Show less subfields' : 'Show more subfields'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardBody>
                                </>
                            )}

                            <hr className="m-0" />
                            <CardBody>
                                <Contributors researchFieldId={id} />
                            </CardBody>
                        </Card>
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
