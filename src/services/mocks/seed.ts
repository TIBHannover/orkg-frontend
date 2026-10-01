import { createMSWClass, createMSWPredicate, createMSWResource, createMSWStatement } from '@/services/mocks/helpers';

// Seed database with initials entities
const seed = async () => {
    await createMSWResource({ id: 'R144080', label: 'Test Resource R0 production number', classes: ['C4000'] });
    for (let index = 0; index < 3; index += 1) {
        await createMSWResource({ id: `R${index}`, label: `resource label ${index}` });
    }
    // DCLocation resources
    await createMSWResource({ label: 'Hannover', classes: ['DCLocation'] });
    await createMSWResource({ label: 'Annaba', classes: ['DCLocation'] });
    await createMSWResource({ id: 'R25007', label: 'Lombardy, Italy', classes: ['DCLocation'] });

    // Predicates
    await createMSWPredicate({ id: 'P1', label: 'property 1' });
    await createMSWPredicate({ id: 'P2', label: 'property 2' });

    //
    await createMSWPredicate({ id: 'P32', label: 'research problem' });
    await createMSWPredicate({ id: 'P5049', label: 'location' });
    await createMSWPredicate({ id: 'P15414', label: 'Time period' });
    await createMSWPredicate({ id: 'P23140', label: 'Basic reproduction number' });

    // Classes
    await createMSWClass({ id: 'C4000', label: 'R40006' });
    await createMSWClass({ id: 'Contribution', label: 'Contribution' });
    await createMSWClass({ id: 'Problem', label: 'Problem' });
    await createMSWClass({ id: 'DCLocation', label: 'dc:Location' });

    // Statements
    await createMSWResource({ id: 'R44727', label: 'Contribution 1', classes: ['Contribution', 'C4000'], shared: 2 });
    await createMSWResource({ id: 'R44546', label: 'Determination of the COVID-19 basic reproduction number', classes: ['Problem'], shared: 36 });
    await createMSWResource({ id: 'R44730', label: 'Time interval', classes: ['C2005'], shared: 1, formatted_label: '2020-01-14 - 2020-03-08' });
    await createMSWResource({
        id: 'R44728',
        label: 'Basic reproduction number estimate value specification',
        classes: ['C5001'],
        shared: 1,
        formatted_label: '3.1',
    });
    await createMSWStatement({ subject: 'R44727', predicate: 'P32', object: 'R44546' });
    await createMSWStatement({ subject: 'R44727', predicate: 'P5049', object: 'R25007' });
    await createMSWStatement({ subject: 'R44727', predicate: 'P15414', object: 'R44730' });
    await createMSWStatement({ subject: 'R44727', predicate: 'P23140', object: 'R44728' });
};

export default seed;
