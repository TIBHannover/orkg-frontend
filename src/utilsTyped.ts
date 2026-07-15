import { MouseEvent } from 'react';
import slugifyString from 'slugify';

import DEDICATED_PAGE_LINKS from '@/components/Resource/hooks/redirectionSettings';
import { reverse } from '@/lib/namedRoute';

/**
 * True when a click should be left to the browser / next-link default
 * (open in new tab/window, download): a modifier key is held or a
 * non-primary button was used. Mirrors next/link's internal isModifiedEvent.
 * Use in Links that intercept plain left-clicks for shallow URL updates.
 */
export const isModifiedClickEvent = (event: MouseEvent) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

/**
 * Use reverse from '@/lib/namedRoute' and automatically slugifies the slug param
 * @param input string that should be slugified
 */
export const slugify = (input: string) => slugifyString(input.replace('/', ' '), '_');

/**
 * Use reverse from '@/lib/namedRoute' and automatically slugifies the slug param
 * @param route name of the route
 * @param params route params to pass
 * @param params.slug the slug for this param
 */
export const reverseWithSlug = (route: string, params: { [key: string]: string | string[] | undefined; slug?: string }) =>
    reverse(route, { ...params, slug: params.slug ? slugify(params.slug) : undefined });

/**
 * Get the dedicated link for a resource
 * @param classes classes of the resource
 * @returns the dedicated link
 */
export const getDedicatedLink = (classes?: string[]) => {
    for (const _class of classes ?? []) {
        if (_class in DEDICATED_PAGE_LINKS) {
            // only for a link for the first class occurrence (to prevent problems when a
            // resource has multiple classes form the list), so return
            return DEDICATED_PAGE_LINKS[_class];
        }
    }
    return undefined;
};

// https://stackoverflow.com/questions/42921220/is-any-solution-to-do-localstorage-setitem-in-asynchronous-way-in-javascript
export const asyncLocalStorage = {
    setItem: (key: string, value: string): Promise<void> =>
        Promise.resolve().then(() => {
            try {
                localStorage.setItem(key, value);
            } catch {
                /* storage unavailable */
            }
        }),
    getItem: (key: string): Promise<string | null> =>
        Promise.resolve().then(() => {
            try {
                return localStorage.getItem(key);
            } catch {
                return null;
            }
        }),
    removeItem: (key: string): Promise<void> =>
        Promise.resolve().then(() => {
            try {
                localStorage.removeItem(key);
            } catch {
                /* storage unavailable */
            }
        }),
};
