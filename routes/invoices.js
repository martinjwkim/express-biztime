const db = require('../db');
const express = require('express');

const router = new express.Router();
const ExpressError = require("../expressError")

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices`
    );
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const invoice_results = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
      FROM invoices
      WHERE id = $1`, [req.params.id]
    );

    if (invoice_results.rows.length === 0) {
      throw new ExpressError("invoice not found", 404)
    }

    const company_results = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [invoice_results.rows[0].comp_code]
    )

    let invoice = invoice_results.rows[0];
    let company = company_results.rows[0];
    invoice.company = company;

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const results = await db.query(
      `INSERT INTO invoices(comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { amt } = req.body;

    const results = await db.query(
      `UPDATE invoices SET amt = $1
      WHERE id = $2
      RETURNING id, name, description`,
      [amt, req.params.id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError("invoice not found", 404)
    }

    return res.json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
})

router.delete(`/:id`, async (req, res, next) => {
  try {
    const results = await db.query(
      `DELETE FROM invoices
      WHERE id = $1`, [req.params.id]
    );

    console.log(results);

    if (results.rowCount === 0) {
      throw new ExpressError("invoice not found", 404)
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;

