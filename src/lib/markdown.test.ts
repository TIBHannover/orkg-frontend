import { parseMarkdown } from '@/lib/markdown';

const MATOMO_OPT_OUT_SRC =
    'https://support.tib.eu/piwik/index.php?module=CoreAdminHome&amp;action=optOut&amp;language=en&amp;backgroundColor=ffffff&amp;fontColor=&amp;fontSize=14px&amp;fontFamily=%22Helvetica%20Neue%22%2CHelvetica%2CArial%2Csans-serif';

/** Matomo opt-out embed as it appears in the data-protection CMS page */
const MATOMO_OPT_OUT_EMBED = `<strong>Matomo-Opt-Out</strong>
<p>
    The information generated with Matomo about the use of this website is
    processed and stored exclusively with the ORKG.
</p>
<iframe
    title="Matomo opt-out"
    src="${MATOMO_OPT_OUT_SRC}"
    style="border: 0px; height: 130px; width: 100%"
></iframe>`;

const getIframeSrc = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('iframe')?.getAttribute('src') ?? null;
};

describe('parseMarkdown iframe sanitization', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('keeps the Matomo opt-out iframe src when the tracker URL is protocol-relative', () => {
        // Production sets the tracker URL without a scheme (standard Matomo embed form)
        vi.stubEnv('NEXT_PUBLIC_MATOMO_TRACKER_URL', '//support.tib.eu/piwik/');
        const src = getIframeSrc(parseMarkdown(MATOMO_OPT_OUT_EMBED));
        expect(src).toContain('https://support.tib.eu/piwik/index.php?module=CoreAdminHome&action=optOut');
    });

    it('keeps the Matomo opt-out iframe src when the tracker URL is absolute', () => {
        vi.stubEnv('NEXT_PUBLIC_MATOMO_TRACKER_URL', 'https://support.tib.eu/piwik/');
        const src = getIframeSrc(parseMarkdown(MATOMO_OPT_OUT_EMBED));
        expect(src).toContain('https://support.tib.eu/piwik/index.php?module=CoreAdminHome&action=optOut');
    });

    it('strips the Matomo iframe src when no tracker URL is configured', () => {
        vi.stubEnv('NEXT_PUBLIC_MATOMO_TRACKER_URL', '');
        expect(getIframeSrc(parseMarkdown(MATOMO_OPT_OUT_EMBED))).toBeNull();
    });

    it('strips iframe src from untrusted hosts', () => {
        vi.stubEnv('NEXT_PUBLIC_MATOMO_TRACKER_URL', '//support.tib.eu/piwik/');
        expect(getIframeSrc(parseMarkdown('<iframe src="https://evil.example.com/embed"></iframe>'))).toBeNull();
    });

    it('keeps video embed iframes from trusted hosts', () => {
        const src = getIframeSrc(parseMarkdown('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'));
        expect(src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
});
