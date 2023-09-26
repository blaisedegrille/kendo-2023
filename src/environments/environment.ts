import { env } from './.env';
import { LoginTypes } from '../app/shared/login-types';

export const environment = {
  production: false,
  hmr: true,
  environment: 'LOCAL',
  loginType: LoginTypes['Windows'],
  version: env['npm_package_version'],
  serverUrl: 'https://localhost:44362',
  logoutUrl: '/login',
  defaultLanguage: 'hu-HU',
  supportedLanguages: ['hu-HU'],
};
