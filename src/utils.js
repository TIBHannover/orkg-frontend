export function hashCode(s) {
    return s.split("").reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

export function groupBy(array, group) {
    const hash = Object.create(null);
    const result = [];

    array.forEach((a) => {
        if (!hash[a[group]]) {
            hash[a[group]] = [];
            result.push(hash[a[group]]);
        }
        hash[a[group]].push(a);
    });

    return result;
}

export const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};