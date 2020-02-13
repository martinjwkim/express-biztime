process.env.NODE_ENV = "test";

const app = require('../app');
const request = require('supertest');
const db = require('../db');

let testCompanies;
let testInvoices;

beforeEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  console.log('******************')
  let companies_response = await db.query(`
    INSERT INTO companies
    VALUES  ('amzn', 'Amazon', 'They ship stuff'),
            ('msft', 'Microsoft', 'Bill Gates is rich'),
            ('goog', 'Google', 'They got your data')
    RETURNING code, name`
  );

  testCompanies = companies_response.rows;
  
  let invoice_response = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES  ('amzn', 500, false, null),
            ('msft', 300, false, null),
            ('goog', 1200, false, null),
            ('goog', 2.99, false, null)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );

  testInvoices = invoice_response.rows;
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('Gets a list of 3 companies', async () => {
    let response = await request(app).get('/companies');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: testCompanies
    });
  });
});

describe('POST /invoices', () => {
  test('Adds an invoice', async () => {
    let response = await request(app)
      .post('/invoices')
      .send({
        comp_code: 'goog',
        amt: '1450'
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: 'goog',
        amt: 1450,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });
});