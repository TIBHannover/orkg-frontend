import { createMSWClass, createMSWPredicate, createMSWResource, createMSWStatement } from 'services/mocks/helpers';

// Seed database with initials entities
const seed = () => {
    createMSWResource({ id: 'R144080', label: 'Test Resource R0 production number', classes: ['C4000'] });
    for (let index = 0; index < 3; index += 1) {
        createMSWResource({ id: `R${index}`, label: `resource label ${index}` });
    }
    // DCLocation resources
    createMSWResource({ label: 'Hannover', classes: ['DCLocation'] });
    createMSWResource({ label: 'Annaba', classes: ['DCLocation'] });
    createMSWResource({ id: 'R25007', label: 'Lombardy, Italy', classes: ['DCLocation'] });

    // Predicates
    createMSWPredicate({ id: 'P1', label: 'property 1' });
    createMSWPredicate({ id: 'P2', label: 'property 2' });

    //
    createMSWPredicate({ id: 'P32', label: 'research problem' });
    createMSWPredicate({ id: 'P5049', label: 'location' });
    createMSWPredicate({ id: 'P15414', label: 'Time period' });
    createMSWPredicate({ id: 'P23140', label: 'Basic reproduction number' });

    // Classes
    createMSWClass({ id: 'C4000', label: 'R40006' });
    createMSWClass({ id: 'Contribution', label: 'Contribution' });
    createMSWClass({ id: 'Problem', label: 'Problem' });
    createMSWClass({ id: 'DCLocation', label: 'dc:Location' });

    // Statements
    createMSWResource({ id: 'R44727', label: 'Contribution 1', classes: ['Contribution', 'C4000'], shared: 2 });
    createMSWResource({ id: 'R44546', label: 'Determination of the COVID-19 basic reproduction number', classes: ['Problem'], shared: 36 });
    createMSWResource({ id: 'R44730', label: 'Time interval', classes: ['C2005'], shared: 1, formatted_label: '2020-01-14 - 2020-03-08' });
    createMSWResource({
        id: 'R44728',
        label: 'Basic reproduction number estimate value specification',
        classes: ['C5001'],
        shared: 1,
        formatted_label: '3.1',
    });
    createMSWStatement({ subject: 'R44727', predicate: 'P32', object: 'R44546' });
    createMSWStatement({ subject: 'R44727', predicate: 'P5049', object: 'R25007' });
    createMSWStatement({ subject: 'R44727', predicate: 'P15414', object: 'R44730' });
    createMSWStatement({ subject: 'R44727', predicate: 'P23140', object: 'R44728' });
};

export default seed;
