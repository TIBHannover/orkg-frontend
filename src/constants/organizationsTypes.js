export const ORGANIZATIONS_MISC = {
    GENERAL: 'general',
    CONFERENCE: 'conference',
    JOURNAL: 'journal'
};

export const ORGANIZATIONS_TYPES = [
    { id: ORGANIZATIONS_MISC.GENERAL, label: 'General', requireDate: false },
    { id: ORGANIZATIONS_MISC.CONFERENCE, label: 'Conference', requireDate: true },
    { id: ORGANIZATIONS_MISC.JOURNAL, label: 'Journal', requireDate: false }
];
