import { env } from 'next-runtime-env';

const grobidUrl = env('NEXT_PUBLIC_GROBID_URL');

export default async function processPdf({ pdf }: { pdf: File }) {
    const form = new FormData();
    form.append('input', pdf);
    const response = await fetch(`${grobidUrl}api/processFulltextDocument`, {
        method: 'POST',
        body: form,
    });
    if (!response.ok) {
        throw new Error('Error fetching GROBID parse');
    } else {
        return response.text();
    }
}
