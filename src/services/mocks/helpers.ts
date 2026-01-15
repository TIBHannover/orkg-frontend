import { faker } from '@faker-js/faker';
import { SnakeCasedProperties } from 'type-fest';

import { MISC } from '@/constants/graphSettings';
import { Class, Literal, Predicate, Resource, Statement } from '@/services/backend/types';
import db from '@/services/mocks/db';

export const findEntityById = (id: string) => {
    const tables = [db.resources, db.literals, db.classes, db.lists];
    for (const table of tables) {
        const entity = table.findFirst({
            where: {
                id: { equals: id },
            },
        });
        if (entity) return entity;
    }
    return null;
};

export const createMSWResource = (data: Partial<Resource>) => {
    const id = `R${faker.number.int()}`;
    const { classes, ...rest } = data;
    return db.resources.create({
        id: data.id ?? `R${faker.number.int()}`,
        label: data.label ?? `resource ${id}`,
        created_at: faker.date.recent().toISOString(),
        classes: classes && classes?.length ? classes.join(',') : '',
        shared: 0,
        created_by: faker.string.uuid(),
        featured: faker.datatype.boolean(),
        unlisted: faker.datatype.boolean(),
        verified: faker.datatype.boolean(),
        extraction_method: 'UNKNOWN',
        organization_id: faker.string.uuid(),
        observatory_id: faker.string.uuid(),
        formatted_label: data.formatted_label ?? '',
        ...rest,
    });
};

export const createMSWPredicate = (data: Partial<Predicate>) => {
    const id = `R${faker.number.int()}`;
    return db.predicates.create({
        id: data.id ?? `P${faker.number.int()}`,
        label: data.label ?? `predicate ${id}`,
        created_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(),
        ...data,
    });
};

export const createMSWLiteral = (data: Partial<SnakeCasedProperties<Literal>>) => {
    const id = `L${faker.number.int()}`;

    return db.literals.create({
        id: data.id ?? `L${faker.number.int()}`,
        label: data.label ?? `literal ${id}`,
        datatype: MISC.DEFAULT_LITERAL_DATATYPE,
        created_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(),
        ...data,
    });
};

export const createMSWClass = (data: Partial<Class>) => {
    const id = `C${faker.number.int()}`;
    return db.classes.create({
        id: data.id ?? `C${faker.number.int()}`,
        label: data.label ?? `class ${id}`,
        uri: data.uri ?? null,
        created_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(),
        ...data,
    });
};

export const createMSWStatement = (
    data: Partial<Omit<Statement, 'subject' | 'predicate' | 'object'>> & { subject: string; predicate: string; object: string },
) => {
    const { subject, predicate, object, ...rest } = data;
    return db.statements.create({
        id: data.id ?? `S${faker.number.int()}`,
        subject: subject ?? faker.string.uuid(),
        predicate: predicate ?? faker.string.uuid(),
        object: object ?? faker.string.uuid(),
        created_at: faker.date.recent().toISOString(),
        created_by: faker.string.uuid(),
        extraction_method: 'UNKNOWN',
        organization_id: faker.string.uuid(),
        observatory_id: faker.string.uuid(),
        ...rest,
    });
};
