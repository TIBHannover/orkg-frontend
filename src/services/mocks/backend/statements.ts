import { http, HttpResponse } from 'msw';
import { statementsUrl } from 'services/backend/statements';
import { bulkStatementsTableResource } from 'services/mocks/backend/__mocks__/Statements';
import db from 'services/mocks/db';
import { createMSWStatement, findEntityById } from 'services/mocks/helpers';

const statements = [
    http.get(`${statementsUrl}:id/bundle`, ({ params }) => {
        const { id } = params as { id: string };
        if (!id) {
            throw new Error();
        }
        const MAPPING: Record<string, { root: string; statements: any[] }> = {
            TableResource: bulkStatementsTableResource,
        };
        if (MAPPING[id]) {
            return HttpResponse.json(MAPPING[id]);
        }
        return HttpResponse.json({ root: id, statements: [] });
    }),
    http.get(statementsUrl, ({ request }) => {
        const url = new URL(request.url);
        const objectId = url.searchParams.get('object_id');
        const subjectId = url.searchParams.get('subject_id');
        const page = Number(url.searchParams.get('page')) ?? 0;
        const size = Number(url.searchParams.get('size')) ?? 9999;
        const allStatements = db.statements.getAll();
        const currentStatements = db.statements.findMany({
            ...(subjectId
                ? {
                      where: {
                          subject: {
                              equals: subjectId,
                          },
                      },
                  }
                : {}),
            ...(objectId
                ? {
                      where: {
                          object: {
                              equals: objectId,
                          },
                      },
                  }
                : {}),
            take: size ? Number(size) : undefined,
            skip: page ? Number(page) * 10 : undefined,
        });

        return HttpResponse.json({
            content: currentStatements.map((s) => {
                const subjectRef = findEntityById(s.subject);
                const predicateRef = db.predicates.findFirst({
                    where: {
                        id: { equals: s.predicate },
                    },
                });
                const objectRef = findEntityById(s.object);
                return {
                    ...s,
                    subject:
                        subjectRef && 'classes' in subjectRef
                            ? { ...subjectRef, classes: subjectRef?.classes.split(',').filter((c) => c !== '') }
                            : subjectRef,
                    predicate: predicateRef,
                    object:
                        objectRef && 'classes' in objectRef
                            ? { ...objectRef, classes: objectRef?.classes.split(',').filter((c) => c !== '') }
                            : objectRef,
                };
            }),
            pageable: {
                sort: { sorted: true, unsorted: false, empty: false },
                pageNumber: 0,
                pageSize: size,
                offset: 0,
                paged: true,
                unpaged: false,
            },
            totalPages: Math.ceil(allStatements.length / size),
            totalElements: allStatements,
            last: page + 1 >= Math.ceil(allStatements.length / size),
            first: page === 0,
            sort: { sorted: true, unsorted: false, empty: false },
            size,
            number: 0,
            numberOfElements: currentStatements.length,
            empty: false,
        });
    }),
    http.post(statementsUrl, async ({ request }: { request: Request }) => {
        const { subject_id: subjectId, predicate_id: predicateId, object_id: objectId } = await request.json();

        const newStatement = createMSWStatement({ subject: subjectId, predicate: predicateId, object: objectId });

        const subject = findEntityById(subjectId);
        const predicate = db.predicates.findFirst({
            where: {
                id: { equals: predicateId },
            },
        });
        const object = findEntityById(objectId);
        return HttpResponse.json({
            ...newStatement,
            subject: subject && 'classes' in subject ? { ...subject, classes: subject?.classes.split(',') } : subject,
            predicate,
            object: object && 'classes' in object ? { ...object, classes: object?.classes.split(',') } : object,
        });
    }),
    http.delete(`${statementsUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };
        db.statements.delete({
            where: {
                id: {
                    equals: id,
                },
            },
        });
        return HttpResponse.json(null);
    }),
];

export default statements;
