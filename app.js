const express = require('express');
const bodyParser = require('body-parser');
const PaymentGateway = require('./paymentGateway');
const { check, validationResult } = require('express-validator');
const db = require('./utils/database');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('paymentForm');
});

app.post('/processPayment', [
  check('amount').isNumeric(),
  check('currency').isIn(['USD', 'EUR', 'THB', 'HKD', 'SGD', 'AUD']),
  check('customerFullName').notEmpty(),
  check('cardHolderName').notEmpty(),
  check('cardNumber').isCreditCard(),
  check('expiration').isLength({ min: 5, max: 5 }).withMessage('Expiration date must be in format MM/YY'),
  check('cvv').isLength({ min: 3, max: 4 }).isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { amount, currency, customerFullName, cardHolderName, cardNumber, expiration, cvv } = req.body;

  const paymentGateway = new PaymentGateway();

  try {
    // Process payment with Braintree
    const braintreeResult = await paymentGateway.processBraintreePayment(amount, {
      number: cardNumber,
      expirationMonth: expiration.split('/')[0],
      expirationYear: expiration.split('/')[1],
      cvv: cvv
    });

    // Save order data and payment response to database
    await db.saveOrder({
      amount,
      currency,
      customerFullName,
      paymentGateway: 'Braintree',
      paymentResponse: braintreeResult
    });

    res.send('Payment successful');
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).send('Payment failed');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});