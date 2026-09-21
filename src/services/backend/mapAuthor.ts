import { AuthorRequest } from '@orkg/orkg-client';

import { UpdateAuthor } from '@/services/backend/types';

// authors come from edit forms, which produce explicit null ids and may omit identifiers —
// the generated AuthorRequest forbids the null and requires the map, so normalize here
export const toAuthorRequest = (author: UpdateAuthor): AuthorRequest => ({
    name: author.name,
    identifiers: author.identifiers ?? {},
    ...(author.id ? { id: author.id } : {}),
    ...(author.homepage ? { homepage: author.homepage } : {}),
});
