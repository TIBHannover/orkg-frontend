import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { AnimationContainer, PropertyItem, ValueItem } from 'components/ViewPaper/SmartSuggestions/styled';
import useEntityRecognition from 'components/ViewPaper/hooks/useEntityRecognition';
import useInsertData from 'components/ViewPaper/hooks/useInsertData';
import { ENTITIES } from 'constants/graphSettings';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { useDebounce } from 'react-use';
import { ListGroup } from 'reactstrap';
import { determineActiveNERService, getNerResults, saveFeedback } from 'services/orkgNlp';
import { setNerProperties, setNerRawResponse, setNerResources } from 'slices/viewPaperSlice';

function NERSuggestions({ title = '', abstract = '' }) {
    const nerProperties = useSelector(state => state.viewPaper.nerProperties);
    const dispatch = useDispatch();
    const { handleInsertData } = useInsertData();
    const [activeNERService, setActiveNERService] = useState(null);

    const { suggestions } = useEntityRecognition({ activeNERService, title, abstract });
    const researchField = useSelector(state => state.viewPaper.researchField);

    useEffect(() => {
        (async () => setActiveNERService(await determineActiveNERService(researchField?.id)))();
    }, [researchField]);

    useDebounce(
        () => {
            const processNlpData = async () => {
                const data = await getNerResults({ title, abstract, service: activeNERService });
                dispatch(setNerResources(data.resources));
                dispatch(setNerProperties(data.properties));
                dispatch(setNerRawResponse(data.response));
            };
            if (activeNERService) {
                processNlpData();
            }
        },
        500,
        [abstract, dispatch, title],
    );

    const handleInsert = ({ property, resource }) => {
        handleInsertData([
            {
                object: resource,
                property: {
                    id: property,
                    label: nerProperties?.[property]?.label,
                },
            },
        ]);
        try {
            saveFeedback({
                request: {
                    title,
                    abstract,
                },
                response: { property, resource },
                serviceName: activeNERService,
            });
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div>
            {Object.keys(suggestions).length > 0 && <h6 className="mt-2">Statements</h6>}
            <ListGroup>
                {Object.keys(suggestions).map(key => (
                    <Fragment key={key}>
                        {suggestions[key].length > 0 && (
                            <PropertyItem color="smart" className="py-1">
                                <DescriptionTooltip id={nerProperties?.[key]?.id} _class={ENTITIES.PREDICATE} showURL>
                                    {capitalize(nerProperties?.[key]?.label)}
                                </DescriptionTooltip>
                            </PropertyItem>
                        )}
                        <TransitionGroup component={null}>
                            {suggestions[key].map(item => (
                                <AnimationContainer
                                    key={item.id || item.label}
                                    classNames="slide-left"
                                    className="py-2 d-flex align-items-center px-2"
                                    timeout={{ enter: 600, exit: 600 }}
                                >
                                    <ValueItem
                                        action
                                        style={{ fontSize: '90%', cursor: 'pointer' }}
                                        onClick={() =>
                                            handleInsert({
                                                property: key,
                                                resource: item,
                                            })
                                        }
                                    >
                                        <DescriptionTooltip
                                            id={item.isExistingValue ? item.id : null}
                                            _class={ENTITIES.RESOURCE}
                                            showURL={item.isExistingValue}
                                        >
                                            <Icon icon={faAngleDoubleLeft} className="text-smart me-2" /> {item.label}
                                        </DescriptionTooltip>
                                    </ValueItem>
                                </AnimationContainer>
                            ))}
                        </TransitionGroup>
                    </Fragment>
                ))}
            </ListGroup>
        </div>
    );
}

NERSuggestions.propTypes = {
    title: PropTypes.string,
    abstract: PropTypes.string,
};

export default NERSuggestions;
