import { http, HttpResponse } from 'msw';

// in case no handler are available, fallback to these handlers
const defaultHandlers = [
    http.get('*', () => HttpResponse.json({}, { status: 200 })),
    http.post('*', () => HttpResponse.json({}, { status: 200 })),
    http.patch('*', () => HttpResponse.json({}, { status: 200 })),
    http.put('*', () => HttpResponse.json({}, { status: 200 })),
    http.delete('*', () => HttpResponse.json({}, { status: 200 })),
];

export default defaultHandlers;
