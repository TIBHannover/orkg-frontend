import { Author, Node, UpdateAuthor } from '@/services/backend/types';

export type { Author, UpdateAuthor };

export type ResearchField = Node | null;

export type PublishedIn = { id?: string; label: string } | null;

export type PublicationMonthValue = string;
export type PublicationYearValue = string;
