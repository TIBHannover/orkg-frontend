import getGeoNames from 'services/geoNames/index';
import { CLASSES } from 'constants/graphSettings';

/**
 *  Fetch autocomplete options from external APIs
 *  the data structure of each option:
 *  {
 *      id: null,
 *      label: 'Label of the option',
 *      external : true,
 *      source: 'Service/Ontology Name'
 *      statements: [{
 *          predicate: { id: 'PREDICATE ID in ORKG', label: 'Label of predicate' }
 *          value: { _class: 'resource|predicate|literal|class',id: null, label: 'Label of value', datatype: 'The datatype if literal' }
 *      }],
 *      tooltipData: [{
 *          property: ''
 *          value: ''
 *      }]
 *  }
 *
 * @param {String} value Search Query
 * @param {Array} prevOptions Loaded options for current search.
 * @return {Array} The list of loaded options including the options from geonames.org with ids = 'GeoNames' and a property external = true
 */
export default function getExternalData(value, options, optionsClass) {
    let items = options;
    switch (optionsClass) {
        case CLASSES.LOCATION:
            items = getGeoNames(value, options);
            break;
        default:
            // console.log('No third party registries');
            break;
    }
    return items;
}
