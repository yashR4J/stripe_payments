const express = require('express')
const bodyparser = require('body-parser')
const stripe = require('stripe')('sk_test_51MTjyzFL8Boi9QU8OcxXNJGi1BQIiDSdQraEMVgSynDjSY7VADfzKDMytr9D4sd5haxsxlAYEUN1K4LYHqBvQBDl00wKtmiUtH',
{
    apiVersion: '2020-08-27',
    appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/identity/modal",
    version: "0.0.1",
    url: "https://github.com/stripe-samples"
  }
})
const uuid = require('uuid').v4
const cors = require('cors')

const app = express()
app.use(cors())

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
const PORT = process.env.PORT || 5000

// post request
app.post('/checkout', async (req, res) => {

    let error, status

    try {
        const {product, token} = req.body
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })

        const key = uuid()
        const charge = await stripe.charge.create(
            {
                amount: product.price * 100,
                currency: 'aud',
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address.line1,
                        line2: token.card.address.line2,
                        city: token.card.address.city,
                        country: token.card.address.country,
                        postal_code: token.card.address_zip,
                    },
                },
            },
            {
                key,
            }
        );
        console.log("Charge: ", {charge});
        status = "success";
    } catch {
        console.error("Error: ", error);
        status = "failure";
    }

    res.json({error, status});
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
});