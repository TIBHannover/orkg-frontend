import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useEntityRecognition from 'components/AddPaper/hooks/useEntityRecognition';
import useInsertData from 'components/AddPaper/hooks/useInsertData';
import Tooltip from 'components/Utils/Tooltip';
import { capitalize } from 'lodash';
import { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { getNerResults } from 'services/annotation';
import { setNerProperties, setNerResources } from 'slices/addPaperSlice';
import styled from 'styled-components';

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

const EntityRecognition = () => {
    const { title, abstract, nerProperties } = useSelector(state => state.addPaper);
    const dispatch = useDispatch();
    const { handleInsertData } = useInsertData();
    const { suggestions } = useEntityRecognition();

    useEffect(() => {
        const processNlpData = async () => {
            const data = await getNerResults({ title, abstract });
            dispatch(setNerResources(data.resources));
            dispatch(setNerProperties(data.properties));
        };
        processNlpData();
    }, [abstract, dispatch, title]);

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

    return (
        <>
            <h3 className="h5">
                <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                    Smart suggestions
                </Tooltip>
            </h3>
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
        </>
    );
};

export default EntityRecognition;
