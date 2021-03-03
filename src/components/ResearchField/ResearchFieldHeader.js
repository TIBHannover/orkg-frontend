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
import { faPen, faEllipsisV, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import Contributors from './Contributors';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';

const ResearchFieldHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
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
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
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
                                {researchFieldData.description && <div className="mb-4">{researchFieldData.description}</div>}
                                {researchFieldData.sameAs && (
                                    <ExternalDescription
                                        query={researchFieldData.sameAs ? researchFieldData.sameAs.label : researchFieldData.label}
                                    />
                                )}
                            </CardBody>
                            <hr className="m-0" />
                            <CardBody>
                                <CardTitle tag="h5">Subfields</CardTitle>
                                <div>
                                    {subResearchFields.slice(0, 9).map(subfield => (
                                        <Link key={`index${subfield.id}`} to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: subfield.id })}>
                                            <Badge color="lightblue" className="mr-2 mb-2">
                                                {subfield.label}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {subResearchFields.length > 5 && (
                                        <Button color="link" size="sm">
                                            Show more subfields
                                        </Button>
                                    )}
                                    {subResearchFields && subResearchFields.length === 0 && <>No sub research fields.</>}
                                </div>
                            </CardBody>
                            <hr className="m-0" />
                            <CardBody>
                                <Contributors id={id} />
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
