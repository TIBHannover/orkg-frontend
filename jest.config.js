const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
const config = {
    testEnvironment: './jsdom-extended.js',
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
    moduleDirectories: ['node_modules', 'src'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|md)$': 'identity-obj-proxy',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
};

module.exports = createJestConfig(config);
