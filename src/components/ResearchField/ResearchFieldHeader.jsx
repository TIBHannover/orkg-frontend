import { faEllipsisV, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Badge, Button, ButtonDropdown, Container, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import CheckClasses from '@/components/CheckClasses/CheckClasses';
import CheckSlug from '@/components/CheckSlug/CheckSlug';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useAuthentication from '@/components/hooks/useAuthentication';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useResearchField from '@/components/ResearchField/hooks/useResearchField';
import ExternalDescription from '@/components/ResearchProblem/ExternalDescription';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import Contributors from '@/components/TopContributors/Contributors';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

const ResearchFieldHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const { isCurationAllowed } = useAuthentication();
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField();

    const _subResearchFields = !showMoreFields && subResearchFields?.length > 0 ? subResearchFields.slice(0, 9) : subResearchFields;

    return (
        <>
            {!isLoading && !isFailedLoading && <CheckSlug label={researchFieldData.label} route={ROUTES.RESEARCH_FIELD} />}
            {!isLoading && !isFailedLoading && (
                <CheckClasses classes={researchFieldData.classes} targetClass={CLASSES.RESEARCH_FIELD} resourceId={researchFieldData.id} />
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
            {!isLoading && !isFailedLoading && (
                <>
                    {editMode && (
                        <DataBrowserDialog
                            isEditMode
                            show={editMode}
                            toggleModal={() => setEditMode((v) => !v)}
                            id={id}
                            label={researchFieldData.label}
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
                                        onClick={() => setEditMode((v) => !v)}
                                        style={{ marginRight: 2 }}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
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
                                {researchFieldData.description && <hr className="my-3" />}
                            </>
                        )}
                        {subResearchFields && subResearchFields.length > 0 && (
                            <>
                                <h2 className="h5">Subfields</h2>
                                <div>
                                    {_subResearchFields.map((subfield) => (
                                        <Link
                                            key={`index${subfield.id}`}
                                            href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                researchFieldId: subfield.id,
                                                slug: subfield.label,
                                            })}
                                        >
                                            <Badge color="light" className="me-2 mb-2">
                                                {subfield.label}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {subResearchFields.length > 9 && (
                                        <Button onClick={() => setShowMoreFields((v) => !v)} color="link" size="sm" className="p-0 ms-2">
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
    id: PropTypes.string.isRequired,
};

export default ResearchFieldHeader;
