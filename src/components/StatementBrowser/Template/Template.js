import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import TemplateHeader from 'components/StatementBrowser/Template/TemplateHeader/TemplateHeader';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setDoneAnimation } from 'slices/statementBrowserSlice';
import { AddPropertyWrapper, AnimationContainer } from 'components/StatementBrowser/Template/styled';
import PropertySuggestions from 'components/StatementBrowser/Template/PropertySuggestions';

const Template = (props) => {
    const dispatch = useDispatch();
    const resources = useSelector((state) => state.statementBrowser.resources);
    const property = useSelector((state) => state.statementBrowser.properties.byId[props.propertyId]);
    let propertyIds = [];
    let shared = 1;
    if (Object.keys(resources.byId).length !== 0 && props.value.resourceId) {
        propertyIds = resources.byId[props.value.resourceId].propertyIds;
        shared = resources.byId[props.value.resourceId].shared ?? 1;
    }

    return (
        <AnimationContainer
            classNames="fadeIn mt-3 pb-3"
            in
            timeout={!property.isAnimated ? { enter: 700 } : { enter: 0 }}
            addEndListener={() => {
                if (!property.isAnimated) {
                    dispatch(setDoneAnimation({ id: props.propertyId }));
                }
            }}
            appear
        >
            <div>
                <TemplateHeader
                    syncBackend={props.syncBackend}
                    value={props.value}
                    id={props.id}
                    propertyId={props.propertyId}
                    resourceId={props.selectedResource}
                    enableEdit={props.enableEdit}
                />
                {propertyIds.map((propertyId, index) => (
                    <StatementItem
                        key={`statement-${index}`}
                        id={propertyId}
                        enableEdit={shared <= 1 ? props.enableEdit : false}
                        syncBackend={props.syncBackend}
                        isLastItem={propertyIds.length === index + 1}
                        showValueHelp={false}
                        inTemplate
                        contextStyle="Template"
                        resourceId={props.value.resourceId}
                    />
                ))}
                {props.enableEdit && <PropertySuggestions selectedResource={props.value.resourceId} />}
                {props.enableEdit && (
                    <AddPropertyWrapper className="mb-3">
                        <div className="row gx-0">
                            <div className="col-4 propertyHolder" />
                        </div>
                        <AddProperty syncBackend={props.syncBackend} inTemplate resourceId={props.value.resourceId} />
                    </AddPropertyWrapper>
                )}
            </div>
        </AnimationContainer>
    );
};

Template.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    selectedResource: PropTypes.string.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
};

export default Template;
