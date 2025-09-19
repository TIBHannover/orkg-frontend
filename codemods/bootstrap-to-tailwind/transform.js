/**
 * Codemod: Bootstrap → Tailwind class conversion
 * - Converts Bootstrap class names found in JSX/TSX className to Tailwind utilities
 * - Leaves unknown classes intact
 * - Adds a configurable Tailwind prefix to converted utilities (default: "tw-")
 *   To use a variant-style prefix (as requested), pass --twPrefix="tw:" when running
 *
 * Usage example:
 *   npx jscodeshift -t codemods/bootstrap-to-tailwind/transform.js "src/**\/*.{jsx,tsx}" --parser=tsx --extensions=tsx,jsx --twPrefix="tw:"
 */

const path = require('path');
const { mapToken, applyPrefix } = require('./mapping');

// Prefer the TSX parser by default
module.exports.parser = 'tsx';

/**
 * Returns the tw prefix from options; defaults to 'tw:'
 */
function getTwPrefix(options) {
    const prefix = options?.twPrefix;
    if (typeof prefix === 'string' && prefix.length > 0) return prefix;
    return 'tw:';
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect the original quote character from a Literal/StringLiteral node.
 * Returns one of '"', '\'' or '`'. Defaults to '"' if unknown.
 */
function detectQuoteFromLiteral(node) {
    const raw = (node && node.extra && node.extra.raw) || node.raw;
    if (typeof raw === 'string' && raw.length > 0) {
        const ch = raw[0];
        if (ch === '"' || ch === "'" || ch === '`') return ch;
    }
    return '"';
}

/**
 * Build a string literal node using a specific quote character, preserving raw.
 */
function buildStringLiteral(j, value, quoteChar) {
    function quoteWith(val, qc) {
        const json = JSON.stringify(val); // always double-quoted
        const inner = json.slice(1, -1);
        if (qc === '"') {
            return `"${inner}"`;
        }
        if (qc === "'") {
            const innerAdjusted = inner.replace(/\\"/g, '"').replace(/'/g, "\\'");
            return `'${innerAdjusted}'`;
        }
        // Fallback to double quotes (we don't synthesize template literals here)
        return `"${inner}"`;
    }

    const raw = quoteWith(value, quoteChar);
    const lit = j.literal(value);
    lit.raw = raw;
    lit.extra = { ...(lit.extra || {}), raw, rawValue: value };
    return lit;
}

function getExcludeList(options) {
    const raw = options?.exclude;
    if (typeof raw === 'string' && raw.trim().length > 0) {
        return raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
    // Default excludes
    return ['node_modules', 'public', 'widget', 'dist', 'build', '.next', 'coverage', 'scripts', 'codemods'];
}

function shouldExcludeFile(filePath, excludeList) {
    const posix = filePath.split(path.sep).join('/');
    return excludeList.some((seg) => {
        const pattern = new RegExp(`(^|/)${escapeRegExp(seg)}(/|$)`);
        return pattern.test(posix);
    });
}

function isClassNameAttr(attr) {
    return attr && attr.type === 'JSXAttribute' && (attr.name.name === 'className' || attr.name.name === 'class');
}

function splitTokens(str) {
    return (str || '').split(/\s+/).filter(Boolean);
}

function dedupeTokens(tokens) {
    const seen = new Set();
    const out = [];
    for (const t of tokens) {
        if (!seen.has(t)) {
            seen.add(t);
            out.push(t);
        }
    }
    return out;
}

/**
 * Normalize conflicting Tailwind utilities so that the last one wins.
 * - Resolves conflicts among padding utilities (p-, px-, py-, pt-, pr-, pb-, pl-)
 * - Resolves conflicts among font-size utilities (text-xs..text-9xl)
 * The check is performed per variant chain (e.g., "tw:", "tw:sm:", "tw:hover:").
 */
function normalizeConflictingTokens(tokens) {
    if (!Array.isArray(tokens) || tokens.length === 0) return tokens;

    function splitVariantAndBase(token) {
        const parts = token.split(':');
        const base = parts.pop() || '';
        const variants = parts.join(':'); // e.g., 'tw', 'tw:sm', 'tw:hover'
        return { variants, base };
    }

    function stripImportant(base) {
        return base.startsWith('!') ? base.slice(1) : base;
    }

    function getPaddingDir(core) {
        // Returns one of 'all' | 'x' | 'y' | 't' | 'r' | 'b' | 'l' or null
        const m = core.match(/^p([trblxy]?)-/);
        if (!m) return null;
        const d = m[1] || '';
        if (d === '') return 'all';
        return d;
    }

    function isFontSize(core) {
        return /^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(core);
    }

    function isRingWidth(core) {
        // Matches ring width tokens only, not colors: ring, ring-0, ring-1, ring-2, ring-4, ring-8
        return /^ring(?:-(0|1|2|4|8))?$/.test(core);
    }

    function getRoundedGroup(core) {
        // Matches rounded, rounded-sm, rounded-lg, rounded-none, etc.
        // Also directional: rounded-t, rounded-tr, rounded-b, rounded-l, etc., with optional size
        // Returns a direction key among 'all' | 't' | 'r' | 'b' | 'l' | 'tl' | 'tr' | 'br' | 'bl' or null
        let m = core.match(/^rounded(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$/);
        if (m) return 'all';
        m = core.match(/^rounded-(t|r|b|l|tl|tr|br|bl)(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$/);
        if (m) return m[1];
        return null;
    }

    function conflictsForRounded(dir) {
        // When a new dir arrives, which prior rounded dirs should be removed?
        if (dir === 'all') {
            return ['all', 't', 'r', 'b', 'l', 'tl', 'tr', 'br', 'bl'];
        }
        return ['all', dir];
    }

    function conflictsForPadding(dir) {
        // When a new dir arrives, which prior dirs should be removed?
        switch (dir) {
            case 'all':
                return ['all', 'x', 'y', 't', 'r', 'b', 'l'];
            case 'x':
                return ['all', 'x'];
            case 'y':
                return ['all', 'y', 't', 'b'];
            case 't':
                return ['all', 'y', 't'];
            case 'b':
                return ['all', 'y', 'b'];
            case 'l':
                return ['all', 'x', 'l'];
            case 'r':
                return ['all', 'x', 'r'];
            default:
                return [];
        }
    }

    const out = [];
    // Maps group key -> token string currently in output
    const groupToToken = new Map();

    for (const token of tokens) {
        const { variants, base } = splitVariantAndBase(token);
        const core = stripImportant(base);

        // Determine groups this token belongs to
        const padDir = getPaddingDir(core);
        const isTextSize = isFontSize(core);
        const isRing = isRingWidth(core);
        const roundedDir = getRoundedGroup(core);

        if (!padDir && !isTextSize && !isRing && !roundedDir) {
            out.push(token);
            continue;
        }

        const toRemove = new Set();
        if (padDir) {
            const conflicts = conflictsForPadding(padDir);
            for (const d of conflicts) {
                const key = `${variants}|padding|${d}`;
                const prevToken = groupToToken.get(key);
                if (prevToken) {
                    toRemove.add(prevToken);
                    groupToToken.delete(key);
                }
            }
        }
        if (isTextSize) {
            const key = `${variants}|font-size`;
            const prevToken = groupToToken.get(key);
            if (prevToken) {
                toRemove.add(prevToken);
                groupToToken.delete(key);
            }
        }
        if (isRing) {
            const key = `${variants}|ring-width`;
            const prevToken = groupToToken.get(key);
            if (prevToken) {
                toRemove.add(prevToken);
                groupToToken.delete(key);
            }
        }
        if (roundedDir) {
            const conflicts = conflictsForRounded(roundedDir);
            for (const d of conflicts) {
                const key = `${variants}|rounded|${d}`;
                const prevToken = groupToToken.get(key);
                if (prevToken) {
                    toRemove.add(prevToken);
                    groupToToken.delete(key);
                }
            }
        }

        // Rebuild out without the removed tokens
        if (toRemove.size > 0) {
            for (let i = out.length - 1; i >= 0; i -= 1) {
                if (toRemove.has(out[i])) {
                    out.splice(i, 1);
                }
            }
        }

        // Register current token in its groups
        if (padDir) {
            const key = `${variants}|padding|${padDir}`;
            groupToToken.set(key, token);
        }
        if (isTextSize) {
            const key = `${variants}|font-size`;
            groupToToken.set(key, token);
        }
        if (isRing) {
            const key = `${variants}|ring-width`;
            groupToToken.set(key, token);
        }
        if (roundedDir) {
            const key = `${variants}|rounded|${roundedDir}`;
            groupToToken.set(key, token);
        }

        out.push(token);
    }

    return out;
}

function getImportantOption(options) {
    const val = options?.important;
    if (val == null) return true; // default: always add important as requested
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
        return val === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }
    return true;
}

function addImportantToToken(twToken) {
    if (typeof twToken !== 'string' || twToken.length === 0) return twToken;
    const parts = twToken.split(':');
    const base = parts.pop();
    if (!base) return twToken;
    if (base.startsWith('!')) return [...parts, base].join(':');
    return [...parts, `!${base}`].join(':');
}

function mapClassString(classString, prefix, addImportant) {
    if (typeof classString !== 'string' || classString.trim() === '') return classString;
    // Ensure we preserve surrounding spaces to avoid concatenation issues
    const leadingSpace = /^\s+/.test(classString) ? classString.match(/^\s+/)[0] : '';
    const trailingSpace = /\s+$/.test(classString) ? classString.match(/\s+$/)[0] : '';
    const core = classString.slice(leadingSpace.length, classString.length - trailingSpace.length);

    const originalTokens = splitTokens(core);
    // If any Bootstrap token sets display:flex (d-flex or d-{bp}-flex) or uses row, skip mapping clearfix
    const hasFlexDisplay = originalTokens.some((t) => /^d-(?:(sm|md|lg|xl|xxl)-)?flex$/.test(t) || t === 'row');
    const resultTokens = [];

    for (const tok of originalTokens) {
        // Drop clearfix when flex layout is explicitly set in the same class list
        if (tok === 'clearfix' && hasFlexDisplay) {
            continue;
        }
        const mapped = mapToken(tok);
        if (mapped) {
            const twTokens = splitTokens(mapped).map((t) => {
                const withPrefix = applyPrefix(t, prefix);
                return addImportant ? addImportantToToken(withPrefix) : withPrefix;
            });
            resultTokens.push(...twTokens);
        } else {
            // keep unknown/custom class as-is
            resultTokens.push(tok);
        }
    }

    // First resolve conflicts by category, then dedupe any exact duplicates
    const normalized = normalizeConflictingTokens(resultTokens);
    const mappedCore = dedupeTokens(normalized).join(' ');
    return `${leadingSpace}${mappedCore}${trailingSpace}`;
}

function transformStringLiteral(j, literalNode, prefix, addImportant) {
    const newValue = mapClassString(literalNode.value, prefix, addImportant);
    if (newValue !== literalNode.value) {
        const quote = detectQuoteFromLiteral(literalNode);
        return buildStringLiteral(j, newValue, quote);
    }
    return literalNode;
}

function transformTemplateLiteral(j, tpl, prefix, addImportant) {
    let changed = false;

    function mapPreserveWhitespace(str) {
        if (typeof str !== 'string') return str;
        const leading = (str.match(/^\s*/) || [''])[0];
        const trailing = (str.match(/\s*$/) || [''])[0];
        const core = str.slice(leading.length, str.length - trailing.length);
        const mappedCore = mapClassString(core, prefix, addImportant);
        return `${leading}${mappedCore}${trailing}`;
    }

    const newQuasis = tpl.quasis.map((q) => {
        const raw = q.value.raw;
        const cooked = q.value.cooked;
        const mappedRaw = mapPreserveWhitespace(raw);
        const mappedCooked = mapPreserveWhitespace(cooked);
        if (mappedRaw !== raw || mappedCooked !== cooked) changed = true;
        return j.templateElement({ raw: mappedRaw, cooked: mappedCooked }, q.tail);
    });

    const newExpressions = tpl.expressions.map((ex) => {
        const mapped = transformExpression(j, ex, prefix, addImportant);
        if (mapped !== ex) changed = true;
        return mapped;
    });

    if (!changed) return tpl;
    return j.templateLiteral(newQuasis, newExpressions);
}

function transformClassAttributeValue(j, valueNode, prefix, addImportant) {
    if (!valueNode) return valueNode;
    switch (valueNode.type) {
        case 'Literal':
        case 'StringLiteral':
            if (typeof valueNode.value === 'string') {
                return transformStringLiteral(j, valueNode, prefix, addImportant);
            }
            return valueNode;
        case 'JSXExpressionContainer': {
            const expr = valueNode.expression;
            const newExpr = transformExpression(j, expr, prefix, addImportant);
            if (newExpr !== expr) {
                return j.jsxExpressionContainer(newExpr);
            }
            return valueNode;
        }
        default:
            return valueNode;
    }
}

function transformExpression(j, expr, prefix, addImportant) {
    if (!expr) return expr;
    switch (expr.type) {
        case 'Literal':
        case 'StringLiteral':
            if (typeof expr.value === 'string') {
                return transformStringLiteral(j, expr, prefix, addImportant);
            }
            return expr;
        case 'TemplateLiteral':
            return transformTemplateLiteral(j, expr, prefix, addImportant);
        case 'BinaryExpression': {
            // Handle "str" + expr or expr + "str"
            const left = transformExpression(j, expr.left, prefix, addImportant);
            const right = transformExpression(j, expr.right, prefix, addImportant);
            if (left !== expr.left || right !== expr.right) {
                return j.binaryExpression(expr.operator, left, right);
            }
            return expr;
        }
        case 'ConditionalExpression': {
            const consequent = transformExpression(j, expr.consequent, prefix, addImportant);
            const alternate = transformExpression(j, expr.alternate, prefix, addImportant);
            if (consequent !== expr.consequent || alternate !== expr.alternate) {
                return j.conditionalExpression(expr.test, consequent, alternate);
            }
            return expr;
        }
        case 'ArrayExpression': {
            const newElements = expr.elements.map((el) => (el ? transformExpression(j, el, prefix, addImportant) : el));
            if (newElements.some((el, i) => el !== expr.elements[i])) {
                return j.arrayExpression(newElements);
            }
            return expr;
        }
        case 'ObjectExpression': {
            // classnames({ 'btn': cond, 'btn-primary': isPrimary })
            let changed = false;
            const newProps = expr.properties.map((p) => {
                if (p.type === 'Property' && (p.key.type === 'Literal' || p.key.type === 'StringLiteral')) {
                    const original = p.key.value;
                    const mapped = mapClassString(String(original), prefix, addImportant);
                    if (mapped !== original) {
                        changed = true;
                        const quote = detectQuoteFromLiteral(p.key);
                        const newKey = buildStringLiteral(j, mapped, quote);
                        return j.property('init', newKey, p.value);
                    }
                }
                return p;
            });
            if (changed) return j.objectExpression(newProps);
            return expr;
        }
        case 'CallExpression': {
            // classnames/clsx(...) — transform string-like args
            const callee = expr.callee;
            const isClassnamesCall =
                (callee.type === 'Identifier' && (callee.name === 'classnames' || callee.name === 'clsx')) ||
                (callee.type === 'MemberExpression' && callee.property && (callee.property.name === 'classnames' || callee.property.name === 'clsx'));
            if (!isClassnamesCall) {
                // still try to transform nested string expressions
                const newArgs = expr.arguments.map((arg) => transformExpression(j, arg, prefix, addImportant));
                if (newArgs.some((a, i) => a !== expr.arguments[i])) {
                    return j.callExpression(callee, newArgs);
                }
                return expr;
            }
            const newArgs = expr.arguments.map((arg) => transformExpression(j, arg, prefix, addImportant));
            if (newArgs.some((a, i) => a !== expr.arguments[i])) {
                return j.callExpression(callee, newArgs);
            }
            return expr;
        }
        default:
            return expr;
    }
}

module.exports = function transformer(file, api, options) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const prefix = getTwPrefix(options);
    const excludeList = getExcludeList(options);
    const forceImportant = getImportantOption(options);

    // Skip excluded paths
    if (shouldExcludeFile(file.path || file.filePath || '', excludeList)) {
        return file.source;
    }

    // Transform JSX class attributes
    root.find(j.JSXAttribute)
        .filter((path) => isClassNameAttr(path.node))
        .forEach((path) => {
            const { node } = path;
            const newValue = transformClassAttributeValue(j, node.value, prefix, forceImportant);
            if (newValue !== node.value) {
                node.value = newValue;
            }
        });

    // Also transform plain React.createElement calls with className prop
    root.find(j.CallExpression, { callee: { type: 'MemberExpression', object: { name: 'React' }, property: { name: 'createElement' } } }).forEach(
        (path) => {
            const args = path.node.arguments;
            if (args.length >= 2 && args[1] && args[1].type === 'ObjectExpression') {
                for (const prop of args[1].properties) {
                    if (
                        prop.type === 'Property' &&
                        ((prop.key.type === 'Identifier' && (prop.key.name === 'className' || prop.key.name === 'class')) ||
                            (prop.key.type === 'Literal' && (prop.key.value === 'className' || prop.key.value === 'class')))
                    ) {
                        const newVal = transformExpression(j, prop.value, prefix, forceImportant);
                        if (newVal !== prop.value) {
                            prop.value = newVal;
                        }
                    }
                }
            }
        },
    );

    return root.toSource({ trailingComma: true });
};
