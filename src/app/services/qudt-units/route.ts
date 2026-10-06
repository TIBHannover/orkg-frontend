import { NextResponse } from 'next/server';

import { fetchQudtUnitsCached } from '@/services/qudt';

export async function GET() {
    try {
        const units = await fetchQudtUnitsCached();
        return NextResponse.json(units, { headers: { 'Cache-Control': 'public, max-age=3600' } });
    } catch (error) {
        console.error('QUDT units fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch QUDT units' }, { status: 500 });
    }
}
