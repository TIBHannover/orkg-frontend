export const removeLinebreaks = (str: string): string => {
    return str?.trim().replace(/[\r\n]+/gm, ' ') ?? '';
};

export default removeLinebreaks;
