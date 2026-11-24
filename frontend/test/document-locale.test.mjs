import assert from 'node:assert/strict';
import test from 'node:test';
import { documentLocale } from '../components/storefront/commerce.mjs';

test('SSR login and register routes retain Arabic and RTL locale without query parameters', () => {
  assert.equal(documentLocale({ query: {}, asPath: '/ar/page/account/login' }), 'ar');
  assert.equal(documentLocale({ query: {}, req: { url: '/ar/page/account/register?returnTo=%2Far' } }), 'ar');
  assert.equal(documentLocale({ query: { lng: 'sv' }, asPath: '/en/page/account/login' }), 'sv');
  assert.equal(documentLocale({ query: { lng: ['ar'] }, asPath: '/ar/page/account/login' }), 'ar');
  assert.equal(documentLocale({ asPath: '/_next/opaque', req: { url: '/ar/page/account/login' } }), 'ar');
  assert.equal(documentLocale({ asPath: '//malformed' }), 'en');
  assert.equal(documentLocale({ asPath: '/page/account/login' }), 'en');
  assert.equal(documentLocale({ asPath: '/zz/page/account/login' }), 'en');
});
