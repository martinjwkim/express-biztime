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

        const company_results = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`, [invoice_results.rows[0].comp_code]
        )

        if (invoice_results.rows.length === 0) {
            throw new ExpressError("invoice not found", 404)
        }

        invoice_results.rows[0].company = company_results.rows[0]

        return res.json({ invoice: invoice_results.rows[0] });
    } catch (err) {
        return next(err);
    }
})

// router.post('/', async (req, res, next) => {
//     try {
//         const { id, name, description } = req.body;

//         const results = await db.query(
//             `INSERT INTO invoices(id, name, description)
//              VALUES ($1, $2, $3)
//              RETURNING id, name, description`,
//             [id, name, description]
//         );

//         return res.status(201).json({ invoice: results.rows[0] });
//     } catch (err) {
//         return next(err);
//     }
// })

// router.put('/:id', async (req, res, next) => {
//     try {
//         const { name, description } = req.body;

//         const results = await db.query(
//             `UPDATE invoices SET name = $1, description = $2
//              WHERE id = $3
//              RETURNING id, name, description`,
//             [name, description, req.params.id]
//         );

//         if (results.rows.length === 0) {
//             throw new ExpressError("invoice not found", 404)
//         }
        
//         return res.json({ invoice: results.rows[0] });
//     } catch (err) {
//         return next(err);
//     }
// })

// router.delete(`/:id`, async (req, res, next) => {
//     try {
//         const results = await db.query(
//             `DELETE FROM invoices
//              WHERE id = $1`, [req.params.id]
//         );

//         if (results.rows.length === 0) {
//             throw new ExpressError("invoice not found", 404)
//         }

//         return res.json({ status: 'deleted' });
//     } catch (err) {
//         return next(err);
//     }
// })

module.exports = router;

