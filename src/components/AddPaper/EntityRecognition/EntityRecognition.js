import { faAngleDoubleLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useEntityRecognition from 'components/AddPaper/hooks/useEntityRecognition';
import usePredicatesRecommendation from 'components/AddPaper/hooks/usePredicatesRecommendation';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import useInsertData from 'components/AddPaper/hooks/useInsertData';
import Tooltip from 'components/Utils/Tooltip';
import { capitalize } from 'lodash';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useDebounce } from 'react-use';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import { getNerResults } from 'services/orkgNlp';
import { ENTITIES } from 'constants/graphSettings';
import { createPropertyAction as createProperty } from 'slices/statementBrowserSlice';
import { setNerProperties, setNerResources, setNerRawResponse } from 'slices/addPaperSlice';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const AnimationContainer = styled(CSSTransition)`
    &.slide-left-enter {
        opacity: 0;
        transform: translateX(-100%);
        margin-bottom: -40px;
    }
    &.slide-left-enter-active {
        opacity: 1;
        transition: opacity 0.7s, transform 0.7s, margin-bottom 0.5s linear;
        transform: translateX(0%);
        margin-bottom: 0;
    }
    &.slide-left-exit {
        opacity: 1;
        transform: translateX(0%);
        margin-bottom: 0;
    }
    &.slide-left-exit-active {
        opacity: 0;
        transition: opacity 0.7s, transform 0.7s, margin-bottom 0.5s linear;
        transform: translateX(-100%);
        margin-bottom: -39px;
    }
`;

const PropertyItem = styled(ListGroupItem)`
    background-color: ${props => props.theme.smart}!important;
    color: #fff !important;
    padding: 1rem 0.6rem;
    font-weight: 500;
`;

const ValueItem = styled(ListGroupItem)`
    background-color: ${props => props.theme.lightLighter}!important;
    &:hover {
        background-color: ${props => props.theme.light}!important;
    }
`;

const ShowMoreButton = styled(Button)`
    &:focus {
        outline: 0 !important;
        box-shadow: none;
    }
`;

const MAX_PROPERTIES_ITEMS = 8;

const EntityRecognition = ({ isComputerScienceField }) => {
    const { title, abstract, nerProperties } = useSelector(state => state.addPaper);
    const [isLoadingNER, setIsLoadingNER] = useState(false);
    const dispatch = useDispatch();
    const { handleInsertData } = useInsertData();
    const { suggestions } = useEntityRecognition({ isComputerScienceField });
    const { recommendedPredicates, isLoadingRP } = usePredicatesRecommendation();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const [showMorePredicates, setShowMorePredicates] = useState(false);

    useDebounce(
        () => {
            const processNlpData = async () => {
                setIsLoadingNER(true);
                const data = await getNerResults({ title, abstract });
                dispatch(setNerResources(data.resources));
                dispatch(setNerProperties(data.properties));
                dispatch(setNerRawResponse(data.response));
                setIsLoadingNER(false);
            };
            if (isComputerScienceField) {
                processNlpData();
            }
        },
        500,
        [abstract, dispatch, title],
    );

    const handleInsert = ({ property, resource }) =>
        handleInsertData([
            {
                object: resource,
                property: {
                    id: property,
                    label: nerProperties?.[property]?.label,
                },
            },
        ]);

    const _recommendedPredicates = showMorePredicates ? recommendedPredicates : recommendedPredicates.slice(0, MAX_PROPERTIES_ITEMS);

    return (
        <>
            {(isLoadingNER || Object.keys(suggestions).length > 0 || recommendedPredicates?.length > 0 || isLoadingRP) && (
                <h3 className="h5 mb-3">
                    <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                        Suggestions
                    </Tooltip>
                </h3>
            )}
            {(isLoadingNER || Object.keys(suggestions).length > 0) && (
                <h6 className="h6 mt-2">
                    Statements{' '}
                    {isLoadingNER && (
                        <>
                            <Icon icon={faSpinner} spin />
                        </>
                    )}
                </h6>
            )}
            <ListGroup>
                {Object.keys(suggestions).map(key => (
                    <Fragment key={key}>
                        {suggestions[key].length > 0 && (
                            <PropertyItem color="smart" className="py-1">
                                {capitalize(nerProperties?.[key]?.label)}
                            </PropertyItem>
                        )}
                        <TransitionGroup component={null}>
                            {suggestions[key].map(item => (
                                <AnimationContainer
                                    key={item.id}
                                    classNames="slide-left"
                                    className="py-2 d-flex align-items-center px-2"
                                    timeout={{ enter: 600, exit: 600 }}
                                >
                                    <ValueItem
                                        action
                                        key={item.id}
                                        style={{ fontSize: '90%', cursor: 'pointer' }}
                                        onClick={() =>
                                            handleInsert({
                                                property: key,
                                                resource: item,
                                            })
                                        }
                                    >
                                        <Icon icon={faAngleDoubleLeft} className="text-smart me-2" /> <div>{item.label}</div>
                                    </ValueItem>
                                </AnimationContainer>
                            ))}
                        </TransitionGroup>
                    </Fragment>
                ))}
            </ListGroup>
            {(isLoadingRP || recommendedPredicates.length > 0) && (
                <h6 className="h6 mt-1">
                    Properties{' '}
                    {isLoadingRP && (
                        <>
                            <Icon icon={faSpinner} spin />
                        </>
                    )}
                </h6>
            )}
            <ListGroup>
                <TransitionGroup component={null} height="30px">
                    {_recommendedPredicates.map((p, index) => (
                        <AnimationContainer
                            key={index}
                            classNames="slide-left"
                            className="py-2 d-flex align-items-center px-2"
                            timeout={{ enter: 600, exit: 600 }}
                        >
                            <ValueItem
                                action
                                style={{ fontSize: '90%', cursor: 'pointer' }}
                                onClick={() =>
                                    dispatch(
                                        createProperty({
                                            resourceId: selectedResource,
                                            existingPredicateId: p.id,
                                            label: p.label,
                                            isTemplate: false,
                                            createAndSelect: true,
                                        }),
                                    )
                                }
                            >
                                <DescriptionTooltip id={p.id} typeId={ENTITIES.PREDICATE}>
                                    <Icon icon={faAngleDoubleLeft} className="text-smart me-2" /> {p.label}
                                </DescriptionTooltip>
                            </ValueItem>
                        </AnimationContainer>
                    ))}
                </TransitionGroup>
            </ListGroup>
            {recommendedPredicates.length > MAX_PROPERTIES_ITEMS && (
                <div className="text-center">
                    <ShowMoreButton onClick={() => setShowMorePredicates(v => !v)} color="link" size="sm" className="p-0 ms-2" style={{ outline: 0 }}>
                        {showMorePredicates ? 'Show less suggestions' : 'Show more suggestions'}
                    </ShowMoreButton>
                </div>
            )}
        </>
    );
};

EntityRecognition.propTypes = {
    isComputerScienceField: PropTypes.bool.isRequired,
};

export default EntityRecognition;
