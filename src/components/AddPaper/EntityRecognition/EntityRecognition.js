import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useInsertData from 'components/AddPaper/hooks/useInsertData';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { getNerResults } from 'services/annotation';
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
    const { title, abstract } = useSelector(state => state.addPaper);
    const [nerResults, setNerResults] = useState({});
    const { getExistingStatement, handleInsertData } = useInsertData();

    // TODO: add all predicates
    const propertyLabelMapping = useMemo(
        () => ({
            P32: 'Has research problem',
            HasLanguage: 'Has language',
            HasMethod: 'Has method'
        }),
        []
    );

    useEffect(() => {
        const processNlpData = async () => {
            const data = await getNerResults({ title, abstract });
            setNerResults(data);
        };
        processNlpData();
    }, [abstract, title]);

    const handleInsert = ({ property, resource }) =>
        handleInsertData([
            {
                object: resource,
                property: {
                    id: property,
                    label: propertyLabelMapping[property]
                }
            }
        ]);

    const displayedEntities = useMemo(() => {
        const _nerResults = {};
        for (const key of Object.keys(nerResults)) {
            _nerResults[key] = nerResults[key].filter(
                item =>
                    !getExistingStatement({
                        object: {
                            label: item.label
                        },
                        property: {
                            label: propertyLabelMapping[key]
                        }
                    })
            );
        }
        return _nerResults;
    }, [getExistingStatement, nerResults, propertyLabelMapping]);

    return (
        <ListGroup className="ml-3">
            {Object.keys(displayedEntities).map(key => (
                <Fragment key={key}>
                    {displayedEntities[key].length > 0 && (
                        <PropertyItem color="smart" className="py-1">
                            {propertyLabelMapping[key]}
                        </PropertyItem>
                    )}
                    <TransitionGroup component={null}>
                        {displayedEntities[key].map(item => (
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
                                            resource: item
                                        })
                                    }
                                >
                                    <Icon icon={faAngleDoubleLeft} className="text-smart mr-2" /> <div>{item.label}</div>
                                </ValueItem>
                            </AnimationContainer>
                        ))}
                    </TransitionGroup>
                </Fragment>
            ))}
        </ListGroup>
    );
};

EntityRecognition.propTypes = {};

export default EntityRecognition;
