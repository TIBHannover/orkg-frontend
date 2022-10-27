import { ListGroup, ListGroupItem, Badge, Col } from 'reactstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { getSuggestedProperties, createPropertyAction as createProperty } from 'slices/statementBrowserSlice';
import { useSelector, useDispatch } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';

const AnimationContainer = styled(CSSTransition)`
    &.slide-up-enter {
        opacity: 0;
        transform: translateY(-100%);
        margin-left: -10px;
    }
    &.slide-up-enter-active {
        opacity: 1;
        transition: opacity 0.7s, transform 0.7s, margin-left 0.5s linear;
        transform: translateY(0%);
        margin-left: 0;
    }
    &.slide-up-exit {
        opacity: 1;
        transform: translateY(0%);
        margin-bottom: 0;
    }
    &.slide-up-exit-active {
        opacity: 0;
        transition: opacity 0.7s, transform 0.7s, margin-left 0.5s linear;
        transform: translateY(-100%);
        margin-left: -10px;
    }
`;

const PropertySuggestions = () => {
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));

    return (
        <Col lg="12">
            <p className="text-muted mt-4">Properties from the used templates</p>

            <ListGroup>
                <TransitionGroup component={null}>
                    {suggestedProperties.map(c => (
                        <AnimationContainer
                            key={`suggested-property-${c.property.id}`}
                            classNames="slide-up"
                            className="py-2 d-flex align-items-center px-2"
                            timeout={{ enter: 600, exit: 600 }}
                        >
                            <ListGroupItem
                                action
                                onClick={() => {
                                    dispatch(
                                        createProperty({
                                            resourceId: selectedResource,
                                            existingPredicateId: c.property.id,
                                            label: c.property.label,
                                            isTemplate: false,
                                            createAndSelect: true,
                                        }),
                                    );
                                }}
                                className="py-2 px-3"
                                style={{ cursor: 'pointer' }}
                            >
                                <DescriptionTooltip id={c.property.id} _class={ENTITIES.PREDICATE}>
                                    <div className="d-flex">
                                        <div className="flex-grow-1">
                                            <Icon icon={faPlus} className="me-1 text-muted" /> {c.property.label}
                                        </div>
                                        <small className="float-end">
                                            <Badge pill className="ms-2">
                                                {c.value?.label ?? ''}
                                            </Badge>
                                        </small>
                                    </div>
                                </DescriptionTooltip>
                            </ListGroupItem>
                        </AnimationContainer>
                    ))}
                </TransitionGroup>
            </ListGroup>
        </Col>
    );
};

export default PropertySuggestions;
