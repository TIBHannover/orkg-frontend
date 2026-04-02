import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faAlignLeft,
    faArrowUpShortWide,
    faArrowUpWideShort,
    faChartArea,
    faChartLine,
    faCubes,
    faDiagramProject,
    faDna,
    faFeatherAlt,
    faFeatherPointed,
    faFileLines,
    faGaugeHigh,
    faGlobe,
    faListAlt,
    faLungsVirus,
    faProjectDiagram,
    faQuestion,
    faSortAmountUp,
    faTable,
    faTachometerAlt,
    faUserFriends,
    faUserGroup,
    faUsers,
    faUserTag,
    faVials,
    faWater,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Maps backend icon labels (Font Awesome export names, e.g. `faMicroscope`) to definitions.
 * Only icons listed here are bundled; add new keys when featured comparisons use more glyphs.
 */
const FEATURED_COMPARISON_SOLID_ICONS: Record<string, IconDefinition> = {
    faUserFriends,
    faAlignLeft,
    faArrowUpShortWide,
    faArrowUpWideShort,
    faChartArea,
    faChartLine,
    faCubes,
    faDiagramProject,
    faDna,
    faFeatherAlt,
    faFeatherPointed,
    faFileLines,
    faGaugeHigh,
    faGlobe,
    faListAlt,
    faLungsVirus,
    faProjectDiagram,
    faQuestion,
    faSortAmountUp,
    faTable,
    faTachometerAlt,
    faUserGroup,
    faUsers,
    faUserTag,
    faVials,
    faWater,
};

const DEFAULT_FEATURED_ICON = faFileLines;

export function resolveFeaturedComparisonSolidIcon(iconName: string): IconDefinition {
    if (!iconName) {
        return DEFAULT_FEATURED_ICON;
    }
    return FEATURED_COMPARISON_SOLID_ICONS[iconName] ?? DEFAULT_FEATURED_ICON;
}
