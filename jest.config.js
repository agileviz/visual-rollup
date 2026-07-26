module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    // The published azure-devops-extension-sdk and azure-devops-extension-api
    // modules are AMD-only — they call `define(...)` at top level, which throws
    // ReferenceError under Jest's Node runtime. Pure helpers in src/Library/
    // never invoke the SDK at module load time, so an empty stub keeps the
    // import chain quiet without forcing each test file to mock individually.
    // Pattern carried over from Throughput launch-prep per
    // feedback_ado_plugin_amd_stub.md.
    "moduleNameMapper": {
        "^azure-devops-extension-sdk$":      "<rootDir>/src/Library/__mocks__/ado-sdk-stub.ts",
        "^azure-devops-extension-api/(.*)$": "<rootDir>/src/Library/__mocks__/ado-sdk-stub.ts"
    },
    // Coverage targets the pure helpers that have unit tests. Widget.tsx and
    // Config.tsx (DOM + SDK orchestration) are intentionally excluded — they
    // are covered by the marketplace smoke test, not Jest. adoLibrary.ts is
    // also excluded; its surface is mocked in tests via the auto-mock at
    // src/Library/__mocks__/adoLibrary.ts.
    "collectCoverageFrom": [
        "src/Library/queryLibrary.ts",
        "src/Library/queryResultsLibrary.ts",
        "src/Library/widgetSettings.ts"
    ],
    "coveragePathIgnorePatterns": [
        "/node_modules/",
        "/__mocks__/"
    ],
    // Thresholds lock in the gains so future PRs can't silently regress them.
    // Floors sit just below current actuals to leave headroom for incidental
    // moves (rename a variable, refactor a one-liner) without false-failing.
    "coverageThreshold": {
        "src/Library/queryLibrary.ts": {
            "statements": 92,
            // Branches floor re-baselined to 71 (current actual: 72.41) on the
            // 2026-07-25 Jest 29 -> 30 upgrade. This is NOT a coverage
            // regression: babel-plugin-istanbul 7 instruments more branches, so
            // the denominator grew 140 -> 174 while covered branches rose
            // 105 -> 126. Same tests, stricter counting. The earlier floor of 74
            // was calibrated against Jest 29's instrumentation. Floor still sits
            // one point below the actual for incidental-move headroom.
            "branches":   71,
            "functions":  100,
            "lines":      94
        },
        "src/Library/queryResultsLibrary.ts": {
            // Floors locked in after the 2026-05-09 focused session brought
            // processTreeQuery from 0% to ~100% line coverage (empty / single-
            // node / multi-level / treeLevel-exceeds-depth / orphan-parent /
            // circular-relations cases) plus direct unit tests on the previously
            // unused Proposed-/InProgress-first sort comparators.
            "statements": 94,
            // Branches floor re-baselined to 74 (current actual: 75.32) on the
            // 2026-07-25 Jest 29 -> 30 upgrade, same cause as above: denominator
            // grew 114 -> 154, covered branches rose 91 -> 116. Previous floor
            // was 78 under Jest 29's instrumentation.
            "branches":   74,
            "functions":  100,
            "lines":      99
        },
        "src/Library/widgetSettings.ts": {
            "statements": 100,
            "branches":   90,
            "functions":  100,
            "lines":      100
        }
    }
};
