import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { FlatCompat } = require('@eslint/eslintrc');
const config = [...new FlatCompat({baseDirectory:import.meta.dirname}).extends('next/core-web-vitals','next/typescript'), {ignores:['.next/**','next-env.d.ts']}];
export default config;
