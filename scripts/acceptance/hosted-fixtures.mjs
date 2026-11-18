import { createRequire } from 'node:module';
import { randomBytes, randomUUID } from 'node:crypto';
import { ensure } from './hosted-clients.mjs';

async function createCustomer(clients, run, label) {
  const email = `hs-acceptance-${label}-${run}@example.invalid`;
  const password = `Hs!${randomBytes(24).toString('base64url')}9`;
  await clients.api('mutation HostedRegister($input:CustomerInput!,$password:String!){createCustomer(input:$input,password:$password){id}}', {
    input: { firstname: 'Acceptance', lastname: label, email }, password,
  });
  const result = await clients.api('mutation HostedLogin($email:String!,$password:String!){loginCustomer(email:$email,password:$password){customer{id} token}}', { email, password });
  return { id: result.data.loginCustomer.customer.id, token: result.data.loginCustomer.token, email, password };
}

export async function stagingBrowserFixtures(clients) {
  ensure(process.env.ALLOW_STAGING_FIXTURES === 'true', 'ALLOW_STAGING_FIXTURES=true is required for dedicated browser test customers');
  const run = randomUUID();
  const customers = [];
  const catalog = await clients.api('query HostedSmokeCatalog{physicalProducts(pagination:{page:1,limit:100},inStock:true){products{id SKU title availableQuantity sizes colors}}}');
  const product = catalog.data?.physicalProducts?.products?.find(item => /^STAGING-/.test(item.SKU) && item.availableQuantity >= 2);
  ensure(product, 'An explicitly seeded STAGING- product with at least two units is needed for browser smoke');
  return {
    run,
    async product() { return { ...product, _id: product.id }; },
    async customer(label) {
      const created = await createCustomer(clients, run, label);
      customers.push(created);
      return created;
    },
    async close() {
      // These carts belong only to this run; no checkout or payment is created in smoke mode.
      for (const customer of customers) {
        const result = await clients.api('query HostedSmokeCart($id:ID!){getCart(userId:$id){id products{_id}}}', { id: customer.id }, customer.token);
        const cart = result.data?.getCart;
        for (const line of cart?.products || []) {
          await clients.api('mutation HostedSmokeRemove($cart:ID!,$line:ID!){deleteCart(cartId:$cart,productId:$line){id}}', { cart: cart.id, line: line._id }, customer.token);
        }
      }
    },
  };
}

export async function stagingFixtures(config, clients) {
  ensure(process.env.ALLOW_STAGING_FIXTURES === 'true', 'ALLOW_STAGING_FIXTURES=true is required for dedicated acceptance data');
  let database;
  try { database = decodeURIComponent(new URL(config.mongoUri).pathname.slice(1)); } catch { throw new Error('Invalid staging MongoDB connection configuration'); }
  ensure(/^highstyle_staging(?:_[a-z0-9_]+)?$/.test(database), 'Fixture database name must be highstyle_staging (or highstyle_staging_<suffix>)');
  const require = createRequire(new URL('../../API/package.json', import.meta.url));
  const mongoose = require('mongoose');
  try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15_000, autoIndex: false });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  ensure(hello.isWritablePrimary === true && !!hello.setName, 'Hosted staging MongoDB must be a writable replica set');
  const models = {
    Product: require('./Model/physicalProductModel'), Company: require('./Model/companyModel'),
    Order: require('./Model/orderModel'), Cart: require('./Model/cartModel'),
    Event: require('./Model/paymentEventModel'), Transaction: require('./Model/transactionModel'),
    Outbox: require('./Model/receiptOutboxModel'),
  };
  const run = randomUUID();
  const products = [];
  const customers = [];
  const company = await models.Company.create({ name: `HighStyle staging acceptance ${run}` });
  async function product(label, stock = 5) {
    const created = await models.Product.create({
      title: `Acceptance ${label} ${run.slice(0, 8)}`, description: 'Dedicated staging test product; never fulfill or list in production.',
      SKU: `STAGING-ACCEPTANCE-${run}-${label}`, price: 12.50, discount: 0, stockQuantity: stock, reservedQuantity: 0,
      colors: [], sizes: [], tags: ['staging-acceptance'], status: 'Available', images: [], company: company._id,
    });
    products.push(String(created._id));
    const visible = await clients.api('query HostedFixture($id:ID!){physicalProduct(id:$id){id title stockQuantity availableQuantity}}', { id: String(created._id) });
    ensure(visible.data?.physicalProduct?.title === created.title, 'Hosted API does not use the same isolated fixture database');
    return created;
  }
  async function customer(label) {
    // No existing user's password, email, session or shopping cart is changed.
    const account = await createCustomer(clients, run, label);
    customers.push(account);
    return account;
  }
  async function cart(customer, product) {
    const result = await clients.api('mutation HostedCart($input:CartInput!){createCart(input:$input){id totalAmount}}', {
      input: { userId: customer.id, products: [{ ProductID: String(product._id), title: 'Untrusted client title', price: 0.01, quantity: 1, totalAmount: 0.01 }], totalAmount: 0.01 },
    }, customer.token);
    ensure(result.data?.createCart?.totalAmount === 12.5, 'Hosted pricing trusted client-supplied amounts');
    return result.data.createCart.id;
  }
  async function close() {
    try {
    // Preserve order/event/transaction audit history. Never bulk-delete a database.
    for (const account of customers) {
      const pending = await models.Order.find({ customer: account.id, paymentStatus: 'PENDING', inventoryStatus: 'RESERVED' }).select('_id').lean();
      for (const order of pending) {
        try { await clients.cancel(account, String(order._id)); } catch { /* A concurrent payment must not be overwritten. */ }
      }
    }
    if (products.length) await models.Product.updateMany({ _id: { $in: products }, reservedQuantity: 0 }, { $set: { status: 'Unavailable' }, $inc: { __v: 1 } });
    } finally { await mongoose.disconnect(); }
  }
  return { ...models, mongoose, run, product, customer, cart, close };
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    throw error;
  }
}
