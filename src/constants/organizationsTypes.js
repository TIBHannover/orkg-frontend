export const ORGANIZATIONS_MISC = {
    GENERAL: 'GENERAL',
    EVENT: 'CONFERENCE',
    JOURNAL: 'JOURNAL',
};

export const ORGANIZATIONS_TYPES = [
    { id: ORGANIZATIONS_MISC.GENERAL, label: 'General', requireDate: false, alternateLabel: 'organization' },
    { id: ORGANIZATIONS_MISC.EVENT, label: 'Event', requireDate: true, alternateLabel: 'conference' },
    { id: ORGANIZATIONS_MISC.JOURNAL, label: 'Journal', requireDate: false, alternateLabel: 'journal' },
];
