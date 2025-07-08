import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        primary: string;
        primaryDarker: string;
        secondary: string;
        secondaryDarker: string;
        light: string;
        lightLighter: string;
        lightDarker: string;
        dark: string;
        smart: string;
        smartDarker: string;
        bodyBg: string;
        bodyColor: string;
        listGroupColor: string;
        borderWidth: string;
        borderRadius: string;
        themeColors: {
            primaryDarker: string;
            secondaryDarker: string;
            lightDarker: string;
            lightLighter: string;
            body: string;
            smart: string;
            smartDarker: string;
        };
        formFeedbackFontSize: string;
        inputBorderRadius: string;
        inputBorderRadiusSm: string;
        btnBorderRadius: string;
        btnBorderRadiusSm: string;
        btnBorderRadiusLg: string;
        inputBg: string;
        inputBtnPaddingX: string;
        inputPaddingX: string;
        btnPaddingXSm: string;
        dropdownLinkHoverBg: string;
        customCheckboxIndicatorBorderRadius: string;
        headingsFontWeight: number;
        headingsColor: string;
        modalContentBorderRadius: string;
        modalContentBorderWidth: string;
        badgeFontSize: string;
        badgeFontWeight: number;
        badgePaddingY: string;
        badgePaddingX: string;
        listGroupBorderColor: string;
        gridBreakpoints: {
            xs: number;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
    }
}
