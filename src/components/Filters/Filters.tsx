import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'motion/react';
import { FC, Fragment, useState } from 'react';
import { Button, Col, Container, Label, Row } from 'reactstrap';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import FilterInputField from '@/components/Filters/FilterInputField/FilterInputField';
import FilterLabel from '@/components/Filters/FilterInputField/FilterLabel';
import useFilterConfig from '@/components/Filters/hooks/useFilterConfig';
import AllFiltersOffCanvas from '@/components/Filters/Panel/AllFiltersOffCanvas';

export const Separator = styled.div`
    @media (max-width: 480px) {
        display: none;
    }
    background: ${(props) => props.theme.secondary};
    width: 2px;
    height: 20px;
    margin: 3px 5px 3px 0px;
    content: '';
    display: block;
    opacity: 0.7;
`;

type FiltersProps = {
    id: string;
};

const Filters: FC<FiltersProps> = ({ id }) => {
    const { filters, isLoadingFilters, canReset, setFilters, showResult, refreshFilters, resetFilters, updateFilterValue } = useFilterConfig({
        oId: id,
    });

    const [showEditPanel, setShowEditPanel] = useState(false);

    const isShowResultActive = filters?.some((f) => f.values && f.values?.length > 0);

    if (isLoadingFilters) {
        return (
            <ContentLoader
                height="100%"
                width="100%"
                viewBox="0 0 100 2"
                style={{ width: '100% !important' }}
                backgroundColor="#dcdee6"
                foregroundColor="#cdced6"
                className="mt-1"
            >
                <rect x="0" y="0" rx="0" ry="0" width="100" height="50" />
            </ContentLoader>
        );
    }

    return (
        <Container className="p-0">
            <div className="px-2 py-2" style={{ backgroundColor: '#dcdee6' }}>
                <Row className="row-cols-lg-auto g-2 align-items-center">
                    <>
                        {filters?.length !== 0 && (
                            <Col className="align-items-center">
                                <span className="me-1">Filters</span>
                                <Separator className="float-end" />
                            </Col>
                        )}
                        {filters?.length === 0 && (
                            <Col className="text-muted">
                                Customize your browsing experience by filtering content based on your preferences. Click{' '}
                                <FontAwesomeIcon size="xs" icon={faFilter} /> to explore filtering options
                            </Col>
                        )}
                        {filters?.slice(0, 2).map((filter, index) => (
                            <Fragment key={filter.id || index}>
                                <Col>
                                    <Label for={filter.id || index.toString()} className="col-form-label">
                                        <FilterLabel filter={filter} />
                                    </Label>
                                </Col>
                                <Col>
                                    <FilterInputField filter={filter} updateFilterValue={updateFilterValue} />
                                </Col>
                            </Fragment>
                        ))}
                        {filters && filters?.length > 2 && (
                            <Col>
                                <Button size="sm" onClick={() => setShowEditPanel((v) => !v)}>
                                    All filters
                                </Button>
                            </Col>
                        )}
                        {(isShowResultActive || canReset) && (
                            <Col>
                                <motion.div
                                    style={{ originX: 1, originY: 0 }}
                                    initial="initial"
                                    exit="initial"
                                    animate="animate"
                                    variants={{
                                        initial: { scale: 0, opacity: 0, y: -10 },
                                        animate: {
                                            scale: 1,
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                type: 'spring',
                                                duration: 0.4,
                                                delayChildren: 0.2,
                                                staggerChildren: 0.05,
                                            },
                                        },
                                    }}
                                >
                                    {isShowResultActive && (
                                        <Button className="me-2" disabled={!isShowResultActive} color="primary" onClick={showResult}>
                                            Show result
                                        </Button>
                                    )}
                                    {canReset && (
                                        <Button color="light" onClick={resetFilters}>
                                            Reset
                                        </Button>
                                    )}
                                </motion.div>
                            </Col>
                        )}
                    </>

                    <Col className="ms-auto">
                        <ActionButton title="All filters" icon={faFilter} action={() => setShowEditPanel((v) => !v)} />
                    </Col>
                </Row>
            </div>

            <AllFiltersOffCanvas
                id={id}
                isOpen={showEditPanel}
                toggle={() => setShowEditPanel((v) => !v)}
                filters={filters ?? []}
                refreshFilters={refreshFilters}
                setFilters={setFilters}
                updateFilterValue={updateFilterValue}
                showResult={showResult}
                resetFilters={resetFilters}
            />
        </Container>
    );
};

export default Filters;
