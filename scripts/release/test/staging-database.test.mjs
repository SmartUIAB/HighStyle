import test from 'node:test';
import assert from 'node:assert/strict';
import { stagingDatabaseName } from '../../acceptance/hosted-fixtures.mjs';

// Parsing must use the same MongoDB driver as the API, without opening a socket.
// These reserved .invalid hosts intentionally cannot resolve on CI.
const valid = [
  ['single host', 'mongodb://mongo.invalid:27017/highstyle_staging', 'highstyle_staging'],
  ['replica set seed list', 'mongodb://mongo1.invalid:27017,mongo2.invalid:27017,mongo3.invalid:27017/highstyle_staging?replicaSet=rs0', 'highstyle_staging'],
  ['encoded credentials', 'mongodb://acceptance:p%40ss%3Aword@mongo1.invalid:27017,mongo2.invalid:27017/highstyle_staging_ci?replicaSet=rs0&authSource=admin', 'highstyle_staging_ci'],
  ['SRV', 'mongodb+srv://cluster.invalid/highstyle_staging?authSource=admin', 'highstyle_staging'],
  ['IPv6 seed list', 'mongodb://[::1]:27017,[::2]:27017/highstyle_staging_ci?replicaSet=rs0', 'highstyle_staging_ci'],
  ['encoded database', 'mongodb://mongo.invalid/%68ighstyle_staging', 'highstyle_staging'],
];

for (const [label, uri, database] of valid) {
  test(`fixture database validation accepts ${label} without connecting`, () => {
    assert.equal(stagingDatabaseName(uri), database);
  });
}

for (const [label, uri] of [
  ['production', 'mongodb://mongo.invalid/highstyle_production'],
  ['authentication database is not the fixture database', 'mongodb://user:password@mongo.invalid/production?authSource=highstyle_staging'],
  ['implicit default database', 'mongodb://mongo.invalid/'],
  ['missing database with staging authSource', 'mongodb://user:password@mongo.invalid/?authSource=highstyle_staging'],
  ['lookalike name', 'mongodb://mongo.invalid/highstyle_stagingproduction'],
  ['empty suffix', 'mongodb://mongo.invalid/highstyle_staging_'],
  ['path suffix', 'mongodb://mongo.invalid/highstyle_staging/production'],
  ['encoded path suffix', 'mongodb://mongo.invalid/highstyle_staging%2Fproduction'],
  ['wrong protocol', 'https://mongo.invalid/highstyle_staging'],
  ['malformed host list', 'mongodb://mongo.invalid:invalid,other.invalid/highstyle_staging'],
  ['multiple SRV hosts', 'mongodb+srv://one.invalid,two.invalid/highstyle_staging'],
  ['empty value', ''],
  ['missing value', undefined],
]) {
  test(`fixture database validation rejects ${label}`, () => {
    assert.throws(() => stagingDatabaseName(uri), /Invalid staging MongoDB connection configuration|Fixture database name must be/);
  });
}

test('invalid database configuration never includes credentials in its error', () => {
  const password = 'DO_NOT_LOG_THIS_FIXTURE_PASSWORD';
  assert.throws(
    () => stagingDatabaseName(`mongodb://acceptance:${password}@mongo.invalid/highstyle_staging?tls=not-a-boolean`),
    error => error.message === 'Invalid staging MongoDB connection configuration' && !error.message.includes(password),
  );
});
