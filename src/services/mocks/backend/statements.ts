import { http, HttpResponse } from 'msw';

import { statementsUrl } from '@/services/backend/statements';
import db from '@/services/mocks/db';
import { createMSWStatement, findEntityById } from '@/services/mocks/helpers';

const findPredicateById = (id: string) => db.predicates.findFirst((q) => q.where({ id }));

const serializeEntity = (entity: ReturnType<typeof findEntityById>) =>
    entity && 'classes' in entity ? { ...entity, classes: entity.classes.split(',').filter((c) => c !== '') } : entity;

const statements = [
    http.get(statementsUrl, ({ request }) => {
        const url = new URL(request.url);
        const objectId = url.searchParams.get('object_id');
        const subjectId = url.searchParams.get('subject_id');
        const page = Number(url.searchParams.get('page')) || 0;
        const size = Number(url.searchParams.get('size')) || 9999;
        const allStatements = db.statements.all();
        const currentStatements = db.statements.findMany(
            (q) =>
                q.where({
                    ...(subjectId ? { subject: subjectId } : {}),
                    ...(objectId ? { object: objectId } : {}),
                }),
            {
                take: size ? Number(size) : undefined,
                skip: page ? Number(page) * 10 : undefined,
            },
        );

        return HttpResponse.json({
            content: currentStatements.map((s) => ({
                ...s,
                subject: serializeEntity(findEntityById(s.subject)),
                predicate: findPredicateById(s.predicate),
                object: serializeEntity(findEntityById(s.object)),
            })),
            page: {
                total_pages: Math.ceil(allStatements.length / size),
                total_elements: allStatements,
                size,
                number: page,
            },
        });
    }),
    http.post(statementsUrl, async ({ request }: { request: Request }) => {
        const { subject_id: subjectId, predicate_id: predicateId, object_id: objectId } = await request.json();

        const newStatement = await createMSWStatement({ subject: subjectId, predicate: predicateId, object: objectId });

        return new HttpResponse(null, {
            headers: {
                Location: `${statementsUrl}/${newStatement?.id}`,
            },
        });
    }),
    http.get(`${statementsUrl}/:id`, ({ params }) => {
        const { id } = params as { id: string };
        const statement = db.statements.findFirst((q) => q.where({ id }));

        if (!statement) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json({
            ...statement,
            subject: serializeEntity(findEntityById(statement.subject)),
            predicate: findPredicateById(statement.predicate),
            object: serializeEntity(findEntityById(statement.object)),
        });
    }),
    http.put(`${statementsUrl}/:id`, async ({ params, request }) => {
        const { id } = params as { id: string };
        const {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: objectId,
        } = (await request.json()) as { subject_id?: string; predicate_id?: string; object_id?: string };

        const updatedStatement = await db.statements.update((q) => q.where({ id }), {
            data(statement) {
                if (subjectId) {
                    statement.subject = subjectId;
                }
                if (predicateId) {
                    statement.predicate = predicateId;
                }
                if (objectId) {
                    statement.object = objectId;
                }
            },
        });

        if (!updatedStatement) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json({
            ...updatedStatement,
            subject: serializeEntity(findEntityById(updatedStatement.subject)),
            predicate: findPredicateById(updatedStatement.predicate),
            object: serializeEntity(findEntityById(updatedStatement.object)),
        });
    }),
    http.delete(`${statementsUrl}/:id`, ({ params }) => {
        const { id } = params as { id: string };
        db.statements.delete((q) => q.where({ id }));
        return HttpResponse.json(null);
    }),
];

export default statements;
