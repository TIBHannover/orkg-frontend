import { faEllipsisV, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Badge, Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import CheckClasses from '@/components/CheckClasses/CheckClasses';
import CheckSlug from '@/components/CheckSlug/CheckSlug';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import FeaturedMark from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Contributors from '@/components/ResearchProblem/Contributors';
import ExternalDescription from '@/components/ResearchProblem/ExternalDescription';
import useResearchProblem from '@/components/ResearchProblem/hooks/useResearchProblem';
import useResearchProblemResearchFields from '@/components/ResearchProblem/hooks/useResearchProblemResearchFields';
import ResearchFieldsBox from '@/components/ResearchProblem/ResearchFieldBox/ResearchFieldsBox';
import SuperResearchProblemBox from '@/components/ResearchProblem/SuperResearchProblemBox/SuperResearchProblemBox';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import AuthorsBox from '@/components/TopAuthors/AuthorsBox';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

const ResearchProblemHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const { researchProblemData, superProblems, isLoading, isFailedLoading, loadResearchProblemData } = useResearchProblem({ id });
    const [researchFields, isLoadingResearchFields] = useResearchProblemResearchFields({ researchProblemId: id });
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: researchProblemData?.unlisted,
        featured: researchProblemData?.featured,
    });

    const subProblems =
        !showMoreFields && researchProblemData.subProblems?.length > 0
            ? researchProblemData.subProblems.slice(0, 9)
            : researchProblemData.subProblems;

    return (
        <>
            {!isLoading && !isFailedLoading && <CheckSlug label={researchProblemData.label} route={ROUTES.RESEARCH_PROBLEM} />}
            {!isLoading && !isFailedLoading && (
                <CheckClasses classes={researchProblemData.classes} targetClass={CLASSES.PROBLEM} resourceId={researchProblemData.id} />
            )}
            {isLoading && (
                <>
                    <div className="mt-4 mb-4 container">
                        <ContentLoader speed={2} width={400} height={20} viewBox="0 0 400 20" style={{ width: '100% !important' }}>
                            <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        </ContentLoader>
                    </div>
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
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
                                <SubTitle>Research problem</SubTitle>
                                <FeaturedMark size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />{' '}
                                <div className="d-inline-block ms-1">
                                    <MarkUnlisted size="sm" resourceId={id} unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </div>
                            </>
                        }
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    className="float-end"
                                    onClick={() => setEditMode((v) => !v)}
                                    style={{ marginRight: 2 }}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end="true">
                                        <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
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
                        <DataBrowserDialog
                            show={editMode}
                            isEditMode
                            toggleModal={() => setEditMode((v) => !v)}
                            id={id}
                            label={researchProblemData.label}
                            onCloseModal={() => loadResearchProblemData(id)}
                        />
                    )}
                    <Container className="p-3 rounded box">
                        <h2 className="h5">Description</h2>
                        {researchProblemData.description && <div className="mb-4">{researchProblemData.description}</div>}
                        {!researchProblemData.description && <div className="mb-2">No description for this research problem yet</div>}
                        {researchProblemData.sameAs && (
                            <ExternalDescription query={researchProblemData.sameAs ? researchProblemData.sameAs.label : researchProblemData.label} />
                        )}

                        {researchProblemData.subProblems && researchProblemData.subProblems.length > 0 && (
                            <>
                                <hr />

                                <h2 className="h5">Subproblems</h2>
                                <div>
                                    {subProblems.map((subfield) => (
                                        <Link
                                            key={`index${subfield.id}`}
                                            href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                researchProblemId: subfield.id,
                                                slug: subfield.label,
                                            })}
                                        >
                                            <Badge color="light" className="me-2 mb-2">
                                                {subfield.label}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {researchProblemData.subProblems.length > 9 && (
                                        <Button onClick={() => setShowMoreFields((v) => !v)} color="link" size="sm" className="p-0 ms-2">
                                            {showMoreFields ? 'Show less subproblems' : 'Show more subproblems'}
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}

                        <hr />
                        <Contributors researchProblemId={id} />
                    </Container>
                    <Container className="p-0">
                        <Row className="mt-4">
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
    id: PropTypes.string.isRequired,
};

export default ResearchProblemHeader;
