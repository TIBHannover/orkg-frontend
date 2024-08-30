import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Card, CardFooter } from 'reactstrap';
import { getParentResearchFields, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faAngleDoubleDown, faSpinner, faHome } from '@fortawesome/free-solid-svg-icons';
import { PREDICATES } from 'constants/graphSettings';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { reverseWithSlug } from 'utils';

const StyledDropdownItem = styled(DropdownItem)`
    &:active,
    &:active.text-primary {
        color: #fff !important;
    }
`;

function Breadcrumbs({ disableLastField = false, backgroundWhite = false, researchFieldId, onFieldClick, route }) {
    const [parentResearchFields, setParentResearchFields] = useState([]);
    const [isOpen, setIsOpen] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSiblings, setIsLoadingSiblings] = useState(false);
    const [siblings, setSiblings] = useState([]);

    useEffect(() => {
        if (researchFieldId) {
            setIsLoading(true);
            getParentResearchFields(researchFieldId)
                .then((result) => {
                    setParentResearchFields(result.reverse());
                    setIsLoading(false);
                    setIsOpen(result.map((s) => false));
                    setSiblings(result.map((s) => []));
                    setIsLoadingSiblings(result.map((s) => false));
                })
                .catch(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [researchFieldId]);

    const handleClickArrow = (index) => {
        setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? true : el)));
        setIsOpen(isOpen.map((el, i) => (i === index ? !el : false)));
        if (siblings[index] && !siblings[index].length) {
            // get siblings of parent
            getStatementsBySubjectAndPredicate({
                subjectId: parentResearchFields[index].id,
                predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD,
            }).then((subRF) => {
                setSiblings(siblings.map((el, i) => (i === index ? subRF.map((s) => s.object) : el)));
                setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
            });
        } else {
            setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
        }
    };

    const renderLink = (field, children, index) => (
        <Link
            href={
                index === 0 ? reverse(ROUTES.HOME) : reverseWithSlug(route || ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })
            }
        >
            {children}
        </Link>
    );

    const renderDropdownItem = (field, children) => {
        if (onFieldClick) {
            return (
                <StyledDropdownItem key={`rf-${field.id}`} className="text-primary" onClick={() => onFieldClick(field)}>
                    {children}
                </StyledDropdownItem>
            );
        }
        return (
            <StyledDropdownItem
                tag={Link}
                key={`rf-${field.id}`}
                href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })}
                className="text-primary"
            >
                {children}
            </StyledDropdownItem>
        );
    };

    if (!researchFieldId) {
        return null;
    }
    return (
        <nav>
            <Container className="p-0">
                <Card className="border-0">
                    <CardFooter
                        className={`rounded border-top-0 ${backgroundWhite ? 'p-0' : ''}`}
                        style={{ fontSize: '95%', backgroundColor: backgroundWhite ? '#fff' : '#dcdee6' }}
                    >
                        {researchFieldId &&
                            !isLoading &&
                            parentResearchFields.map((field, index) => (
                                <span key={field.id}>
                                    {index !== parentResearchFields.length - 1 || !disableLastField
                                        ? renderLink(field, index === 0 ? <Icon className="me-1" icon={faHome} /> : field.label, index)
                                        : field.label}
                                    {index !== parentResearchFields.length - 1 && (
                                        <Dropdown tag="span" isOpen={isOpen[index]} toggle={() => handleClickArrow(index)}>
                                            <DropdownToggle
                                                style={{ cursor: 'pointer', width: '15px', display: 'inline-block' }}
                                                tag="span"
                                                className="flex-1 ms-2 me-2"
                                            >
                                                <Icon
                                                    className={isOpen[index] ? 'me-1' : ''}
                                                    icon={isOpen[index] ? faAngleDoubleDown : faAngleDoubleRight}
                                                />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {!isLoadingSiblings[index] ? (
                                                    <>
                                                        {siblings[index] &&
                                                            siblings[index].length &&
                                                            siblings[index].map((rf) =>
                                                                rf.id !== parentResearchFields[index + 1].id ? (
                                                                    renderDropdownItem(rf, rf.label)
                                                                ) : (
                                                                    <DropdownItem key={`rf-${rf.id}`}>{rf.label}</DropdownItem>
                                                                ),
                                                            )}
                                                    </>
                                                ) : (
                                                    <Icon className="ms-3" icon={faSpinner} spin />
                                                )}
                                            </DropdownMenu>
                                        </Dropdown>
                                    )}
                                </span>
                            ))}
                        {isLoading && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 2"
                                style={{ width: '100% !important' }}
                                backgroundColor={backgroundWhite ? '#f3f3f3' : '#dcdee6'}
                                foregroundColor={backgroundWhite ? '#ecebeb' : '#cdced6'}
                            >
                                <rect x="0" y="0" rx="0" ry="0" width="100" height="50" />
                            </ContentLoader>
                        )}
                    </CardFooter>
                </Card>
            </Container>
        </nav>
    );
}

Breadcrumbs.propTypes = {
    researchFieldId: PropTypes.string,
    disableLastField: PropTypes.bool,
    onFieldClick: PropTypes.func,
    backgroundWhite: PropTypes.bool,
    route: PropTypes.string,
};

export default Breadcrumbs;
