const env = require('@beam-australia/react-env');

const grobidUrl = env('GROBID_URL');

export default async function processPdf({ pdf }) {
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
