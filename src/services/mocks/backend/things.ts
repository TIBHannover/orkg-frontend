import { http, HttpResponse } from 'msw';
import { thingsUrl } from 'services/backend/things';
import db from 'services/mocks/db';

const findResource = (id: string) =>
    db.resources.findFirst({
        where: { id: { equals: id } },
    });

const findClass = (id: string) =>
    db.classes.findFirst({
        where: { id: { equals: id } },
    });

const findPredicate = (id: string) =>
    db.predicates.findFirst({
        where: { id: { equals: id } },
    });

const getDefaultResource = (id: string) => ({
    id,
    label: 'resource label 1',
    created_at: '2020-06-22T10:38:53.178764Z',
    classes: [],
    shared: 0,
    created_by: '00000000-0000-0000-0000-000000000000',
    _class: 'resource',
    observatory_id: '00000000-0000-0000-0000-000000000000',
    extraction_method: 'UNKNOWN',
    organization_id: '00000000-0000-0000-0000-000000000000',
});

const formatResourceResponse = (thing: any) => ({
    ...thing,
    classes: thing.classes.split(',').filter((c: string) => c !== ''),
});

const things = [
    http.get(`${thingsUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };

        const resource = findResource(id);
        if (resource) {
            return HttpResponse.json(formatResourceResponse(resource));
        }

        const classEntity = findClass(id);
        if (classEntity) {
            return HttpResponse.json(classEntity);
        }

        const predicate = findPredicate(id);
        if (predicate) {
            return HttpResponse.json(predicate);
        }

        return HttpResponse.json(getDefaultResource(id));
    }),
];

export default things;
