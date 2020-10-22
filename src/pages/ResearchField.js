import React, { useState } from 'react';
import { Container, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardFooter } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { NavLink } from 'react-router-dom';
import PaperCard from 'components/PaperCard/PaperCard';
import ROUTES from 'constants/routes';

function ResearchField(props) {
    const [researchFieldData, parentResearchFields, isLoading, isFailedLoading] = useResearchField();
    const [papers, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchFieldPapers();
    const [menuOpen, setMenuOpen] = useState(false);
    const { researchFieldId } = props.match.params;

    return (
        <div>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <div>
                    <Container className="d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Research field</h1>

                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                            <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: researchFieldId })}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <h3 className="mt-4 mb-4">{researchFieldData && researchFieldData.label}</h3>
                            </CardBody>

                            <CardFooter>
                                {parentResearchFields.map((field, index) => (
                                    <span key={field.id}>
                                        {index !== parentResearchFields.length - 1 ? (
                                            <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id })}>
                                                {index === 0 ? 'Main' : field.label}
                                            </Link>
                                        ) : (
                                            field.label
                                        )}
                                        {index !== parentResearchFields.length - 1 && <Icon className="ml-2 mr-2" icon={faAngleDoubleRight} />}
                                    </span>
                                ))}
                            </CardFooter>
                        </Card>
                    </Container>

                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Papers</h1>
                    </Container>
                    <Container className="p-0">
                        {papers.length > 0 && (
                            <div>
                                {papers.map(paper => {
                                    return (
                                        paper && (
                                            <PaperCard
                                                paper={{
                                                    id: paper.id,
                                                    title: paper.label,
                                                    ...paper
                                                }}
                                                key={`pc${paper.id}`}
                                            />
                                        )
                                    );
                                })}
                            </div>
                        )}
                        {papers.length === 0 && !isLoadingPapers && (
                            <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                                There are no papers for this research field, yet.
                                <br />
                                <br />
                                <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                    <Button size="sm" color="primary " className="mr-3">
                                        Add paper
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {isLoadingPapers && (
                            <div className="text-center mt-4 mb-4">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoadingPapers && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center mt-2"
                                onClick={!isLoadingPapers ? loadMorePapers : undefined}
                            >
                                Load more papers
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page.</div>}
                    </Container>
                </div>
            )}
        </div>
    );
}

ResearchField.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchFieldId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchField;
