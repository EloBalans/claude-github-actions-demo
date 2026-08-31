import nx from '@nx/eslint-plugin';

/**
 * Module boundaries.
 *
 * Every project carries a `type:` tag and a `scope:` tag (see its
 * `project.json`). The constraints below are what stops the architecture from
 * eroding one convenient import at a time — the dependency graph is a lint
 * error, not a code review opinion.
 *
 * The layering, from the bottom up:
 *
 *   type:contract     the HTTP contract between apps/api and the front end,
 *                     plus the handful of generic helpers every layer may
 *                     use. Depends on nothing; no framework may appear here.
 *   type:domain       the domain model and its rules. Framework-free, so both
 *                     applications can share it.
 *   type:application  use cases, screen state, and the adapters that feed
 *                     them. No components. There is one per platform:
 *                     `application-web` (Angular) and `application-api`
 *                     (Express); they never see each other.
 *   type:ui           presentational components. Typed with the domain model,
 *                     never with a transport DTO — which is why type:contract
 *                     is deliberately absent from its list.
 *   type:feature      routed screens; the only library type that may depend
 *                     on everything.
 *   type:app          the application shells.
 *
 * A second axis, `platform:`, says what a project can be bundled into.
 * `platform:agnostic` code is framework-free and runs on both sides;
 * `platform:web` and `platform:node` cannot see each other. Without it,
 * `type:feature` (which may depend on everything) could pull Express into the
 * browser bundle, and nothing structural would keep the domain framework-free.
 *
 * `type:util` and `type:infrastructure` are kept in the allow lists below but
 * no project carries them today. Add a library with either tag and it also
 * needs its own `sourceTag` entry — a source tag that matches no constraint is
 * unconstrained.
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:contract',
              onlyDependOnLibsWithTags: ['type:contract'],
              bannedExternalImports: ['@angular/*', 'express', 'rxjs'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:domain'],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:contract',
                'type:util',
                'type:infrastructure',
              ],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:util',
                'type:contract',
              ],
              bannedExternalImports: ['@angular/*', 'express'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'platform:agnostic',
              onlyDependOnLibsWithTags: ['platform:agnostic'],
            },
            {
              sourceTag: 'platform:web',
              onlyDependOnLibsWithTags: ['platform:web', 'platform:agnostic'],
            },
            {
              sourceTag: 'platform:node',
              onlyDependOnLibsWithTags: ['platform:node', 'platform:agnostic'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
