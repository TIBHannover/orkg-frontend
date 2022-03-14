import { useState } from 'react';
import {
    Container,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    CardTitle,
    Badge,
    Row,
    Col
} from 'reactstrap';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import Contributors from './Contributors';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import useResearchProblem from 'components/ResearchProblem/hooks/useResearchProblem';
import useResearchProblemResearchFields from 'components/ResearchProblem/hooks/useResearchProblemResearchFields';
import AuthorsBox from 'components/TopAuthors/AuthorsBox';
import ResearchFieldsBox from './ResearchFieldBox/ResearchFieldsBox';
import SuperResearchProblemBox from './SuperResearchProblemBox/SuperResearchProblemBox';
import FeaturedMark from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { NavLink } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import CheckSlug from 'components/CheckSlug/CheckSlug';
import { reverseWithSlug } from 'utils';
import CheckClasses from 'components/CheckClasses/CheckClasses';
import { CLASSES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';

const ResearchProblemHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const { researchProblemData, superProblems, isLoading, isFailedLoading, loadResearchProblemData } = useResearchProblem({ id });
    const [researchFields, isLoadingResearchFields] = useResearchProblemResearchFields({ researchProblemId: id });
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: researchProblemData?.unlisted,
        featured: researchProblemData?.featured
    });

    return (
        <>
            {!isLoading && !isFailedLoading && <CheckSlug label={researchProblemData.label} route={ROUTES.RESEARCH_PROBLEM} />}
            {!isLoading && !isFailedLoading && (
                <CheckClasses classes={researchProblemData.classes} targetClass={CLASSES.PROBLEM} resourceId={researchProblemData.id} />
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
            <Breadcrumbs researchFieldId={!isLoadingResearchFields && researchFields.length ? researchFields[0].field.id : null} disableLastField />
            {!isLoading && !isFailedLoading && (
                <>
                    <TitleBar
                        titleAddition={
                            <>
                                <SubtitleSeparator />
                                <SubTitle>Research problem</SubTitle>
                                <>
                                    <FeaturedMark size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />{' '}
                                    <div className="d-inline-block ms-1">
                                        <MarkUnlisted size="sm" resourceId={id} unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                    </div>
                                </>
                            </>
                        }
                        buttonGroup={
                            <>
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
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id })}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                        wrap={false}
                    >
                        {researchProblemData.label}
                    </TitleBar>
                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={id}
                            label={researchProblemData.label}
                            enableEdit={true}
                            syncBackend={true}
                            onCloseModal={() => loadResearchProblemData(id)}
                        />
                    )}
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <CardTitle tag="h5">Description</CardTitle>
                                {researchProblemData.description && <div className="mb-4">{researchProblemData.description}</div>}
                                {!researchProblemData.description && <div className="mb-2">No description for this research problem yet!</div>}
                                {researchProblemData.sameAs && (
                                    <ExternalDescription
                                        query={researchProblemData.sameAs ? researchProblemData.sameAs.label : researchProblemData.label}
                                    />
                                )}
                            </CardBody>

                            {researchProblemData.subProblems && researchProblemData.subProblems.length > 0 && (
                                <>
                                    <hr className="m-0" />
                                    <CardBody>
                                        <CardTitle tag="h5">Subproblems</CardTitle>
                                        <div>
                                            {researchProblemData.subProblems.slice(0, 9).map(subfield => (
                                                <Link
                                                    key={`index${subfield.id}`}
                                                    to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                        researchProblemId: subfield.id,
                                                        slug: subfield.label
                                                    })}
                                                >
                                                    <Badge color="light" className="me-2 mb-2">
                                                        {subfield.label}
                                                    </Badge>
                                                </Link>
                                            ))}
                                            {researchProblemData.subProblems.length > 9 &&
                                                showMoreFields &&
                                                researchProblemData.subProblems.slice(9).map(subfield => (
                                                    <Link
                                                        key={`index${subfield.id}`}
                                                        to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                            researchProblemId: subfield.id,
                                                            slug: subfield.label
                                                        })}
                                                    >
                                                        <Badge color="light" className="me-2 mb-2">
                                                            {subfield.label}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            {researchProblemData.subProblems.length > 9 && (
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
                                <Contributors researchProblemId={id} />
                            </CardBody>
                        </Card>
                    </Container>
                    <Container className="p-0">
                        <Row className="mt-3">
                            <Col md="4" className="d-flex ">
                                <AuthorsBox researchProblemId={id} />
                            </Col>
                            <Col md="4" className="d-flex mt-3 mt-md-0">
                                <ResearchFieldsBox isLoading={isLoadingResearchFields} researchFields={researchFields} />
                            </Col>
                            <Col md="4" className="d-flex mt-3 mt-md-0">
                                <SuperResearchProblemBox isLoading={isLoadingResearchFields} superProblems={superProblems} />
                            </Col>
                        </Row>
                    </Container>
                </>
            )}
        </>
    );
};

ResearchProblemHeader.propTypes = {
    id: PropTypes.string.isRequired
};

export default ResearchProblemHeader;
