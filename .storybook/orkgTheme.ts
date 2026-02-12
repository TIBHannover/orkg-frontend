import { create } from 'storybook/theming';
// @ts-expect-error - logo is a valid SVG
import logo from '../src/assets/img/logo.svg';

export default create({
    base: 'light',
    brandTitle: 'Open Research Knowledge Graph (ORKG)',
    brandUrl: 'https://orkg.org',
    brandImage: logo,
    brandTarget: '_self',
});
