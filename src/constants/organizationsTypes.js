export const ORGANIZATIONS_MISC = {
    GENERAL: 'GENERAL',
    EVENT: 'CONFERENCE',
    JOURNAL: 'JOURNAL',
};

export const ORGANIZATIONS_TYPES = [
    { id: ORGANIZATIONS_MISC.GENERAL, label: 'General', requireDate: false },
    { id: ORGANIZATIONS_MISC.EVENT, label: 'Event', requireDate: true },
    { id: ORGANIZATIONS_MISC.JOURNAL, label: 'Journal', requireDate: false },
];
