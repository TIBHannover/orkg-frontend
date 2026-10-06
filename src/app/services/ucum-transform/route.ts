import { NextRequest, NextResponse } from 'next/server';

import { fetchUcumTransform, UcumConversionError } from '@/services/qudt/server';

export async function GET(request: NextRequest) {
    const quantity = request.nextUrl.searchParams.get('quantity');
    const from = request.nextUrl.searchParams.get('from');
    const to = request.nextUrl.searchParams.get('to');

    if (!quantity || !from || !to) {
        return NextResponse.json(
            {
                error: 'Missing required query parameters',
                required: ['quantity', 'from', 'to'],
            },
            { status: 400 },
        );
    }

    try {
        const data = await fetchUcumTransform({ quantity, from, to });
        // Deterministic math — let browsers reuse the result across revisits.
        return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'public, max-age=86400' } });
    } catch (error) {
        if (error instanceof UcumConversionError) {
            return NextResponse.json({ error: error.message }, { status: 422, headers: { 'Cache-Control': 'no-store' } });
        }
        return NextResponse.json({ error: 'Failed to contact UCUM service' }, { status: 502 });
    }
}
