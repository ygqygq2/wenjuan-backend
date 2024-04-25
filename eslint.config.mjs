import tseslint from 'typescript-eslint';

import nest from '@ygqygq2/eslint-config/nest.mjs';

export default tseslint.config(...nest, {
  ignores: ['dist', 'src/migrations/*.ts']
});
