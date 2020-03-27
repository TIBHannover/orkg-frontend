import { connect } from 'react-redux';
import { createProperty } from 'actions/statementBrowser';
import uniqBy from 'lodash/uniqBy';
import AddProperty from './AddProperty';

const mapStateToProps = state => {
    let newPropertiesList = [];

    for (const key in state.statementBrowser.properties.byId) {
        const property = state.statementBrowser.properties.byId[key];

        if (!property.existingPredicateId) {
            newPropertiesList.push({
                id: null,
                label: property.label
            });
        }
    }
    //  ensure no properties with duplicate Labels exist
    newPropertiesList = uniqBy(newPropertiesList, 'label');

    return {
        selectedResource: state.statementBrowser.selectedResource,
        newProperties: newPropertiesList
    };
};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddProperty);
