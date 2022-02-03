/**
 * As part of the WCAG, content in tooltips should be hidden when the user presses the escape key.
 * See: https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html
 *
 * To support this in Tippy, the following plugin can be used
 * https://atomiks.github.io/tippyjs/v6/plugins/#hideonesc
 */

const hideOnEsc = {
    name: 'hideOnEsc',
    defaultValue: true,
    fn({ hide }) {
        function onKeyDown(event) {
            if (event.keyCode === 27) {
                hide();
            }
        }

        return {
            onShow() {
                document.addEventListener('keydown', onKeyDown);
            },
            onHide() {
                document.removeEventListener('keydown', onKeyDown);
            }
        };
    }
};

export default hideOnEsc;
