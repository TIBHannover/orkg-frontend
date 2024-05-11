export const ORGANIZATIONS_MISC: {
    [key: string]: string;
} = {
    GENERAL: 'GENERAL',
    EVENT: 'CONFERENCE',
    JOURNAL: 'JOURNAL',
    ORGANIZATION: 'organization',
    CONFERENCE: 'conference',
};

export const ORGANIZATIONS_TYPES = [
    { id: ORGANIZATIONS_MISC.GENERAL, label: 'General', requireDate: false, alternateLabel: 'organization' },
    { id: ORGANIZATIONS_MISC.EVENT, label: 'Event', requireDate: true, alternateLabel: 'conference' },
    { id: ORGANIZATIONS_MISC.JOURNAL, label: 'Journal', requireDate: false, alternateLabel: 'journal' },
];

export const CONFERENCE_REVIEW_MISC: {
    [key: string]: string;
} = {
    SINGLE_BLIND: 'SINGLE_BLIND',
    DOUBLE_BLIND: 'DOUBLE_BLIND',
    OPENREVIEW: 'OPENREVIEW',
};

export const CONFERENCE_REVIEW_TYPE = [
    { id: CONFERENCE_REVIEW_MISC.SINGLE_BLIND, label: 'Single-blind' },
    { id: CONFERENCE_REVIEW_MISC.DOUBLE_BLIND, label: 'Double-blind' },
    { id: CONFERENCE_REVIEW_MISC.OPENREVIEW, label: 'Openreview' },
];
