import Tippy from '@tippyjs/react';
import capitalize from 'capitalize';
import { activatedPropertiesToList } from 'components/Comparison/hooks/helpers';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, FormGroup, Input, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { setConfigurationAttribute, setProperties } from 'slices/comparisonSlice';
import styled, { createGlobalStyle } from 'styled-components';

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 15px !important;
    display: flex !important;
`;
const GlobalStyle = createGlobalStyle`
    .sortable-helper{
        z-index: 10000 !important;
        border-radius: 0 !important;
    }
`;

const SelectProperties = (props) => {
    const dispatch = useDispatch();
    const properties = useSelector((state) => state.comparison.properties);

    /**
     * Toggle a property from the table
     *
     * @param {String} id Property id to toggle
     */
    const toggleProperty = (id) => {
        const newProperties = properties.map((property) => (property.id === id ? { ...property, active: !property.active } : property));
        dispatch(setProperties(newProperties));
        dispatch(setConfigurationAttribute({ attribute: 'predicatesList', value: activatedPropertiesToList(newProperties) }));
    };

    return (
        <Modal isOpen={props.showPropertiesDialog} toggle={props.togglePropertiesDialog}>
            <GlobalStyle />
            <ModalHeader toggle={props.togglePropertiesDialog}>Select properties</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    Info: sorting properties has been moved to the table itself. Make sure you are in edit mode and drag to properties in the desired
                    position from within the table.
                </Alert>
                <ListGroup>
                    {properties.map((property, index) => (
                        <ListGroupItemStyled key={index}>
                            <FormGroup check className="flex-grow-1">
                                <Input
                                    type="checkbox"
                                    id={`checkbox-${property.id}`}
                                    onChange={() => toggleProperty(property.id)}
                                    checked={property.active}
                                />{' '}
                                <Label check for={`checkbox-${property.id}`} className="mb-0">
                                    {capitalize(property.label)}
                                </Label>
                            </FormGroup>
                            <Tippy content="Amount of contributions">
                                <span>
                                    <Badge color="light">{property.contributionAmount}</Badge>
                                </span>
                            </Tippy>
                        </ListGroupItemStyled>
                    ))}
                </ListGroup>
            </ModalBody>
        </Modal>
    );
};

SelectProperties.propTypes = {
    showPropertiesDialog: PropTypes.bool.isRequired,
    togglePropertiesDialog: PropTypes.func.isRequired,
};

export default SelectProperties;
