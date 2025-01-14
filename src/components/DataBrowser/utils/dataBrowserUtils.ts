import { CLASSES, ENTITIES, MISC, RESOURCES } from 'constants/graphSettings';
import { Cookies } from 'react-cookie';
import { createClass } from 'services/backend/classes';
import { createList } from 'services/backend/lists';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createResource, getResource, updateResource } from 'services/backend/resources';
import { Class, EntityType, Node, Predicate, PropertyShape, Resource, Statement, Template } from 'services/backend/types';

const cookies = new Cookies();

export const prioritizeDescriptionStatements = (_statements: Record<string, Statement[]>) => {
    const orderedKeys = Object.keys(_statements).sort((a, b) => {
        // Put description predicates first
        if (a.toLowerCase().includes('description')) return -1;
        if (b.toLowerCase().includes('description')) return 1;
        // Then sort alphabetically
        return a.localeCompare(b);
    });
    return orderedKeys;
};

export const getPreferenceFromCookies = (p: string) => {
    const cookieName = `preferences.${p}`;
    return cookies.get(cookieName) ?? undefined;
};

export const getListPropertiesFromTemplate = (template: Template, required = false) => {
    if (required) {
        return template.properties.filter((ps) => ps.min_count && (ps.min_count as number) > 0).map((ps) => ps.path);
    }
    return template.properties.filter((ps) => !ps.min_count || ps.min_count === 0).map((ps) => ps.path);
};

export const getPropertyShapesByPredicateID = (template: Template, predicateId: string) => {
    return template.properties.filter((ps) => ps.path.id === predicateId);
};

// https://css-tricks.com/snippets/javascript/lighten-darken-color/
const LightenDarkenColor = (col: string, amt: number) => {
    let usePound = false;
    let _col = col;
    if (col[0] === '#') {
        _col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(_col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

/**
 * Get the background color for the statement
 */
export const getBackgroundColor = (index: number) => {
    return index === 0 ? '#fff' : LightenDarkenColor('#f8f9fc', index * -9);
};

/**
 * Check if the property shapes has a literal datatype
 *  (if one of the default data type: Date, String, Number)
 */
export const isLiteral = (propertyShapes: PropertyShape[]) => {
    return !!propertyShapes.find((ps) => 'datatype' in ps && ps.datatype?.id);
};

export const createValue = (_class: EntityType | 'empty', value: Resource | Predicate | Node | { label: string; datatype: string } | Class) => {
    let apiCall;
    switch (_class) {
        case ENTITIES.RESOURCE:
            if ('datatype' in value && value.datatype === 'list') {
                apiCall = createList({ label: value.label });
            } else {
                apiCall = createResource(value.label, 'classes' in value && value.classes ? value.classes : []);
            }
            break;
        case ENTITIES.PREDICATE:
            apiCall = createPredicate(value.label);
            break;
        case ENTITIES.LITERAL:
            apiCall = createLiteral(value.label, 'datatype' in value ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE);
            break;
        case ENTITIES.CLASS:
            apiCall = createClass(value.label);
            break;
        case 'empty':
            apiCall = getResource(RESOURCES.EMPTY_RESOURCE);
            break;
        default:
            apiCall = createLiteral(value.label, 'datatype' in value ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE);
    }
    return apiCall;
};

export const commitChangeLabel = (valueId: string, _class: EntityType, label: string, datatype: string) => {
    const apiCall = _class === ENTITIES.LITERAL ? updateLiteral(valueId, label, datatype) : updateResource(valueId, label);
    return apiCall;
};

export const getResourceFromStatementsById = (id: string, statements: Statement[]) => {
    let resource = statements.find((s) => s.subject.id === id);
    if (resource) {
        return resource.subject;
    }
    if (!resource) {
        resource = statements.find((s) => s.object.id === id);
    }
    if (resource) {
        return resource.object;
    }
    return undefined;
};

export const getStatementsBySubjectId = (id: string, statements: Statement[]) => {
    return statements.filter((s) => s.subject.id === id);
};

export default getListPropertiesFromTemplate;
