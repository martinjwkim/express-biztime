const db = require('../db');
const express = require('express');

const router = new express.Router();
const ExpressError = require("../expressError")

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT code, name 
        FROM companies`
    );
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [req.params.code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404)
    }

    const invoices = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
      FROM invoices
      WHERE comp_code = $1`, [req.params.code]
    );
    
    let company = results.rows[0];
    company.invoices = invoices.rows
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    const results = await db.query(
      `INSERT INTO companies(code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const results = await db.query(
      `UPDATE companies SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
      [name, description, req.params.code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404)
    }

    return res.json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
})

router.delete(`/:code`, async (req, res, next) => {
  try {
    const results = await db.query(
      `DELETE FROM companies
      WHERE code = $1`, [req.params.code]
    );

    if (results.rowCount === 0) {
      throw new ExpressError("Company not found", 404)
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;

