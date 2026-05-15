import type { DefaultTheme } from 'styled-components';

/**
 * Styled-components theme — references CSS custom properties from globals.css.
 * HeroUI semantic vars: --accent, --background, --surface, --border, --foreground.
 * ORKG custom vars: --color-accent-darker, --color-secondary, --color-dark, --color-smart.
 */
const theme: DefaultTheme = {
    primary: 'var(--accent)',
    primaryDarker: 'var(--color-accent-darker)',
    secondary: 'var(--color-secondary)',
    secondaryDarker: 'var(--color-secondary-darker)',
    light: 'var(--background)',
    lightLighter: 'var(--surface)',
    lightDarker: 'var(--default)',
    dark: 'var(--color-dark)',
    smart: 'var(--color-smart)',
    smartDarker: 'var(--color-smart-darker)',
    bodyBg: 'var(--background)',
    bodyColor: 'var(--foreground)',
    listGroupColor: 'var(--foreground)',
    borderWidth: '1px',
    borderRadius: '6px',
    themeColors: {
        primaryDarker: 'var(--color-accent-darker)',
        secondaryDarker: 'var(--color-secondary-darker)',
        lightDarker: 'var(--border)',
        lightLighter: 'var(--surface)',
        body: 'var(--foreground)',
        smart: 'var(--color-smart)',
        smartDarker: 'var(--color-smart-darker)',
    },
    formFeedbackFontSize: '90%',
    inputBorderRadius: '6px',
    inputBorderRadiusSm: '6px',
    btnBorderRadius: '6px',
    btnBorderRadiusSm: '6px',
    btnBorderRadiusLg: '6px',
    inputBg: 'rgb(247, 247, 247)',
    inputBtnPaddingX: '30px',
    inputPaddingX: '0.75rem',
    btnPaddingXSm: '1.25rem',
    dropdownLinkHoverBg: 'rgb(233, 233, 233)',
    customCheckboxIndicatorBorderRadius: '3px',
    headingsFontWeight: 400,
    headingsColor: 'rgb(55, 63, 69)',
    modalContentBorderRadius: '11px',
    modalContentBorderWidth: '3px',
    badgeFontSize: '85%',
    badgeFontWeight: 500,
    badgePaddingY: '0.3rem',
    badgePaddingX: '0.8rem',
    listGroupBorderColor: 'rgba(0, 0, 0, 0.125)',
    gridBreakpoints: {
        xs: 0,
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        xxl: '1400px',
    },
};

export default theme;
