import { http, HttpResponse } from 'msw';

import { statementsUrl } from '@/services/backend/statements';
import db from '@/services/mocks/db';
import { createMSWStatement, findEntityById } from '@/services/mocks/helpers';

const statements = [
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

        const newStatement = createMSWStatement({ subject: subjectId, predicate: predicateId, object: objectId });

        return new HttpResponse(null, {
            headers: {
                Location: `${statementsUrl}${newStatement?.id}`,
            },
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
