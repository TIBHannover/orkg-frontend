import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Papers from 'components/ResearchField/Papers';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ResearchFieldSelector from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { getResearchFieldsStats } from 'services/backend/stats';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { reverseWithSlug } from 'utils';
import TitleBar from 'components/TitleBar/TitleBar';

const ResearchFields = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedResearchField, setSelectedResearchField] = useState('');
    const [researchFields, setResearchFields] = useState([]);
    const [researchFieldLabel, setResearchFieldLabel] = useState('');
    const [researchFieldStats, setResearchFieldStats] = useState({});

    useEffect(() => {
        getResearchFieldsStats().then(results => {
            setResearchFieldStats(results);
        });

        document.title = 'Research field taxonomy browser - ORKG';
    }, []);

    useEffect(() => {
        if (!selectedResearchField) {
            return;
        }
        const field = researchFields.find(rf => rf.id === selectedResearchField);
        setResearchFieldLabel(field ? field.label : selectedResearchField);
    }, [selectedResearchField, researchFields]);

    const handleUpdate = useCallback(data => {
        if (data.selectedResearchField) {
            setSelectedResearchField(data.selectedResearchField);
        }
        if (data.researchFields) {
            setResearchFields(data.researchFields);
        }
    }, []);

    return (
        <>
            <TitleBar
                buttonGroup={
                    <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                        <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                            <Icon icon={faEllipsisV} />
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: MISC.RESEARCH_FIELD_MAIN })}>
                                View resource
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                }
            >
                Research fields taxonomy
            </TitleBar>
            <Container className="p-0">
                <div className="box rounded-3 p-4">
                    <div className="d-flex">
                        <div>
                            <p>
                                The <i>ORKG Research fields taxonomy</i> is used to organize and facilitate browsing and exploring the research
                                knowledge graph.
                            </p>
                            <div>
                                Further information about the taxonomy can be found in the{' '}
                                <a
                                    href="https://www.orkg.org/orkg/help-center/article/20/ORKG_Research_fields_taxonomy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ORKG help center
                                </a>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <Row>
                        <Col md="5" className="border-right">
                            <ResearchFieldSelector
                                selectedResearchField={selectedResearchField}
                                researchFields={researchFields}
                                researchFieldStats={researchFieldStats}
                                updateResearchField={handleUpdate}
                            />
                        </Col>

                        <Col md="7">
                            {selectedResearchField && (
                                <>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h2 className="h5">{researchFieldLabel} papers</h2>
                                        {selectedResearchField !== MISC.RESEARCH_FIELD_MAIN && (
                                            <Button
                                                tag={Link}
                                                to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                    researchFieldId: selectedResearchField,
                                                    slug: researchFieldLabel
                                                })}
                                                color="light"
                                                size="sm"
                                                className="flex-shrink-0 ms-2"
                                            >
                                                Visit field page
                                            </Button>
                                        )}
                                    </div>
                                    <Papers id={selectedResearchField} boxShadow={false} showBreadcrumbs={false} />
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
                <ComparisonPopup />
            </Container>
        </>
    );
};

export default ResearchFields;
