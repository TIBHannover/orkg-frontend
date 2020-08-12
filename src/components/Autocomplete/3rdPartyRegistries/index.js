import getGeonames from './geonames';
import { CLASSES } from 'constants/graphSettings';

/**
 *  Fetch autocomplete options from external APIs
 *  the data structure of each option:
 *  {
 *      id: 'Service/Ontology Name',
 *      label: '',
 *      external : true,
 *      statements: [{
 *          predicate: { id: '', label: '' }
 *          value: { id: '', label: '' }
 *      }],
 *      tooltipData: [{
 *          property: ''
 *          value: ''
 *      }]
 *  }
 *
 * @param {String} value Predicate ID
 * @param {Array} prevOptions Loaded options for current search.
 * @return {Array} The list of loaded options including the options from geonames.org with ids = 'GeoNames' and a property external = true
 */
export default function getExternalData(value, options, optionsClass) {
    let items = options;
    switch (optionsClass) {
        case CLASSES.LOCATION:
            items = getGeonames(value, options);
            break;
        default:
            console('No third party registries');
            break;
    }
    return items;
}
