// id is used to identify the question, must be stable for the same question, and is stored in the persistent storage

const FEEDBACK_QUESTIONS = [
    { id: 1, question: 'This comparison has sufficient properties (rows)', input: 'likert' },
    { id: 2, question: 'The comparison has an adequate description of resources and literals (cells)', input: 'likert' },
    { id: 3, question: 'The comparison has sufficient links to external ontologies', input: 'likert' },
    { id: 4, question: 'The comparison is up-to-date', input: 'likert' },
    { id: 5, question: 'The comparison has sufficient visualizations', input: 'likert' },
    { id: 6, question: 'The comparison has sufficient contributions', input: 'likert' },
    { id: 7, question: 'The comparison description is descriptive', input: 'likert' },
    { id: 8, question: 'Write down any additional comments', input: 'textarea' },
];

export default FEEDBACK_QUESTIONS;
