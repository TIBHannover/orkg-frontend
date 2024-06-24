import { LiteratureListSection, LiteratureListSectionList, LiteratureListSectionText } from 'services/backend/types';

export const isListSection = (section: LiteratureListSection): section is LiteratureListSectionList => {
    return section.type === 'list';
};

export const isTextSection = (section: LiteratureListSection): section is LiteratureListSectionText => {
    return section.type === 'text';
};
