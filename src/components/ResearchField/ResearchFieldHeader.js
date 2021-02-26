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
import { SubTitle, SubtitleSeparator, SmallDropdownToggle } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV, faEllipsisH, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import Gravatar from 'react-gravatar';
import { reverse } from 'named-urls';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }
`;

const StyledDotGravatar = styled.div`
    width: 48px;
    height: 48px;
    display: inline-block;
    text-align: center;
    line-height: 48px;
    color: ${props => props.theme.darkblue};
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.ultraLightBlueDarker};
`;

const Contributors = styled.div`
    display: inline-block;

    & > div {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    & > div:last-child {
        margin-right: 0;
    }
`;

const ResearchFieldHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuOpenContributors, setMenuOpenContributors] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField();
    const prevEditMode = usePrevious({ editMode });
    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResearchFieldData(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

    const contributors = [
        { id: '1', display_name: 'Yaser', gravatar_id: 'c94d1787dd7d06e0f8d44e9473a855a9' },
        { id: '2', display_name: 'Vitalis', gravatar_id: '043bc0ff7214a8e15c996407f12ba7e6' },
        { id: '3', display_name: 'Salamon', gravatar_id: 'd5e9582206dda1c846c25322e87cb3e7' },
        { id: '4', display_name: 'Soren', gravatar_id: 'e21ea840d3036874743af19952438dad' },
        { id: '5', display_name: 'Markus', gravatar_id: '5fa0d96b353bae1f74b632bf8c329d65' },
        { id: '6', display_name: 'Kheir Eddine', gravatar_id: 'e8903e2256c7c313f66a745c6615ea93' }
    ];

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
                                <div className="d-flex mb-3">
                                    <CardTitle tag="h5" className="flex-grow-1">
                                        Contributors
                                    </CardTitle>
                                    <div className="align-self-center">
                                        <ButtonDropdown
                                            isOpen={menuOpenContributors}
                                            toggle={() => setMenuOpenContributors(v => !v)}
                                            className="flex-shrink-0"
                                            style={{ marginLeft: 'auto' }}
                                            size="sm"
                                        >
                                            <SmallDropdownToggle caret size="sm" color="lightblue">
                                                Last 30 days
                                            </SmallDropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem>Last 30 days</DropdownItem>
                                                <DropdownItem>All time</DropdownItem>
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                    </div>
                                </div>

                                <Contributors>
                                    {contributors.slice(0, 18).map(contributor => (
                                        <div>
                                            <Tippy key={`contributor${contributor.id}`} content={contributor.display_name}>
                                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                                                    <StyledGravatar className="rounded-circle" md5={contributor.gravatar_id} size={48} />
                                                </Link>
                                            </Tippy>
                                        </div>
                                    ))}
                                    {contributors.length > 18 && (
                                        <Tippy key="contributor" content="View More">
                                            <StyledDotGravatar className="rounded-circle">
                                                <Icon icon={faEllipsisH} />
                                            </StyledDotGravatar>
                                        </Tippy>
                                    )}
                                </Contributors>
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
