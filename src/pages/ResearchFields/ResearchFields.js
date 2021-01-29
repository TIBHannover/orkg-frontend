import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Papers from 'components/ResearchField/Papers';
import ResearchFieldSelector from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { getResearchFieldsStats } from 'services/backend/stats';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';

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
            <Container className="d-flex align-items-center">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">Research fields taxonomy</h1>

                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                    <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                        <Icon icon={faEllipsisV} />
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: MISC.RESEARCH_FIELD_MAIN })}>
                            View resource
                        </DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </Container>
            <Container className="p-0">
                <div className="box rounded-lg p-4">
                    <Row>
                        <Col className="mr-2 pr-4 border-right">
                            <ResearchFieldSelector
                                selectedResearchField={selectedResearchField}
                                researchFields={researchFields}
                                researchFieldStats={researchFieldStats}
                                updateResearchField={handleUpdate}
                            />
                        </Col>

                        <Col>
                            {selectedResearchField && (
                                <>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h2 className="h5">{researchFieldLabel} papers</h2>
                                        {selectedResearchField !== MISC.RESEARCH_FIELD_MAIN && (
                                            <Button
                                                tag={Link}
                                                to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: selectedResearchField })}
                                                color="light"
                                                size="sm"
                                                className="flex-shrink-0 ml-2"
                                            >
                                                Visit field page
                                            </Button>
                                        )}
                                    </div>
                                    <Papers researchFieldId={selectedResearchField} />
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
};

export default ResearchFields;
