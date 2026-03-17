# Email Verifier

A simple Node.js module to verify email addresses.

## Features

* Email syntax validation
* DNS MX lookup
* SMTP verification
* Typo detection (Did You Mean)
* Unit testing with Jest

## Install

```bash
npm install
```

## Run Tests

```bash
npm test
```

## Usage

```javascript
const { verifyEmail } = require("./emailVerifier");

(async () => {
  const result = await verifyEmail("user@gmial.com");
  console.log(result);
})();
```

## Example Output

```json
{
  "email": "user@gmial.com",
  "result": "invalid",
  "subresult": "typo_detected",
  "didyoumean": "user@gmail.com"
}
```
