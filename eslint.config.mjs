import js from '@eslint/js';
import { configs as tsConfigs } from 'typescript-eslint';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import storybook from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['next.config.js', '*.mjs', 'widget/**', 'public/widget.js', 'public/storybook', '.next/**'],
    },

    js.configs.recommended,
    ...tsConfigs.recommended,
    ...nextCoreWebVitals,
    ...storybook.configs['flat/recommended'],

    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            'no-relative-import-paths': noRelativeImportPaths,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                globalThis: 'readonly',
            },
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'no-relative-import-paths/no-relative-import-paths': ['warn', { rootDir: 'src' }],

            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['next-auth/react'],
                            importNames: ['useSession'],
                            message: 'Please import useSession from `components/hooks/useSession` instead.',
                        },
                        {
                            group: ['next/navigation'],
                            importNames: ['useParams'],
                            message: 'Please import from `components/useParams/useParams` instead.',
                        },
                    ],
                },
            ],

            'no-var': 'error',
            'prefer-const': 'warn',
            curly: 'warn',
            'no-console': ['warn', { allow: ['error'] }],
            'no-param-reassign': ['warn', { props: true, ignorePropertyModificationsFor: ['state'] }],
            'no-await-in-loop': 'warn',
            'no-nested-ternary': 'warn',
            'no-prototype-builtins': 'warn',
            'prefer-destructuring': 'warn',
            'consistent-return': 'warn',
            'no-plusplus': 'warn',
            'prefer-promise-reject-errors': 'warn',

            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'warn',
            'default-param-last': 'off',
            '@typescript-eslint/default-param-last': 'warn',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': 'warn',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'warn',

            'react/self-closing-comp': 'error',
            'react/jsx-curly-brace-presence': 'error',
            'react/prop-types': 2,
            'react/require-default-props': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/function-component-definition': 'off',
            'react/no-unescaped-entities': 'off',
            'react/destructuring-assignment': 'warn',
            'react/no-array-index-key': 'warn',
            'react/jsx-no-useless-fragment': 'warn',
            'react/no-unstable-nested-components': 'warn',
            'react/button-has-type': 'warn',
            'react/display-name': 'warn',

            'jsx-a11y/control-has-associated-label': 'warn',
            'jsx-a11y/anchor-is-valid': 'warn',
            'jsx-a11y/interactive-supports-focus': 'warn',
            'jsx-a11y/label-has-associated-control': 'warn',
            'jsx-a11y/no-noninteractive-tabindex': 'warn',
            'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',

            'import/no-duplicates': 'warn',
            'import/no-cycle': 'warn',
        },
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },
            ],
            'no-return-await': 'off',
            '@typescript-eslint/return-await': 'warn',
        },
    },

    {
        files: ['**/*.stories.*'],
        rules: {
            'import/no-anonymous-default-export': 'off',
        },
    },

    {
        files: ['src/components/Ui/**/*'],
        rules: {
            'no-restricted-imports': 'off',
        },
    },

    prettierConfig,
];
