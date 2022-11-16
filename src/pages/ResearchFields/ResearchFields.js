import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Papers from 'components/ResearchField/Papers';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ResearchFieldSelector from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { getResearchFieldsStats } from 'services/backend/stats';
import { RESOURCES } from 'constants/graphSettings';
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
                    <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                        <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                            <Icon icon={faEllipsisV} />
                        </DropdownToggle>
                        <DropdownMenu end>
                            <DropdownItem tag={NavLink} end to={`${reverse(ROUTES.RESOURCE, { id: RESOURCES.RESEARCH_FIELD_MAIN })}?noRedirect`}>
                                View resource
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                }
            >
                Research fields taxonomy
            </TitleBar>
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                The ORKG research fields taxonomy facilitates browsing and exploring the research knowledge graph.{' '}
                <a href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>
            <Container className="p-0">
                <div className="box rounded-3 p-4">
                    <Row>
                        <Col md="5" className="border-right">
                            <ResearchFieldSelector
                                selectedResearchField={selectedResearchField}
                                researchFields={researchFields}
                                researchFieldStats={researchFieldStats}
                                updateResearchField={handleUpdate}
                                showPreviouslySelected={false}
                            />
                        </Col>

                        <Col md="7">
                            {selectedResearchField && (
                                <>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h2 className="h5">{researchFieldLabel} papers</h2>
                                        {selectedResearchField !== RESOURCES.RESEARCH_FIELD_MAIN && (
                                            <Button
                                                tag={Link}
                                                to={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                    researchFieldId: selectedResearchField,
                                                    slug: researchFieldLabel,
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
