import capitalize from 'capitalize';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, FormGroup, Input, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled, { createGlobalStyle } from 'styled-components';

import { activatedPropertiesToList } from '@/components/Comparison/hooks/helpers';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { setConfigurationAttribute, setProperties } from '@/slices/comparisonSlice';

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
    const { comparison, updateComparison } = useComparison();

    /**
     * Toggle a property from the table
     *
     * @param {String} id Property id to toggle
     */
    const toggleProperty = (id) => {
        const newProperties = properties.map((property) => (property.id === id ? { ...property, active: !property.active } : property));
        dispatch(setProperties(newProperties));
        dispatch(setConfigurationAttribute({ attribute: 'predicatesList', value: activatedPropertiesToList(newProperties) }));
        updateComparison({
            config: {
                ...comparison.config,
                predicates: activatedPropertiesToList(newProperties),
            },
        });
    };

    return (
        <Modal isOpen toggle={props.togglePropertiesDialog}>
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
                            <Tooltip content="Amount of contributions">
                                <span>
                                    <Badge color="light">{property.contributionAmount}</Badge>
                                </span>
                            </Tooltip>
                        </ListGroupItemStyled>
                    ))}
                </ListGroup>
            </ModalBody>
        </Modal>
    );
};

SelectProperties.propTypes = {
    togglePropertiesDialog: PropTypes.func.isRequired,
};

export default SelectProperties;
