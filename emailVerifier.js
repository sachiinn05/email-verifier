const dns = require("dns").promises;
const net = require("net");
const { getDidYouMean } = require("./utils");

function validateSyntax(email) {

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) return false;

  if (email.includes("..")) return false;

  if ((email.match(/@/g) || []).length !== 1) return false;

  return true;

}

async function verifyEmail(email) {

  const start = Date.now();

  const result = {
    email,
    result: "unknown",
    resultcode: 3,
    subresult: "",
    domain: null,
    mxRecords: [],
    executiontime: 0,
    error: null,
    timestamp: new Date().toISOString(),
    didyoumean: null
  };

  try {

    if (!email || typeof email !== "string") {
      result.result = "invalid";
      result.resultcode = 6;
      result.subresult = "empty_email";
      return result;
    }

    if (!validateSyntax(email)) {

      result.result = "invalid";
      result.resultcode = 6;
      result.subresult = "invalid_syntax";

      return result;
    }

    const domain = email.split("@")[1];
    result.domain = domain;

    const suggestion = getDidYouMean(email);

    if (suggestion) {

      result.result = "invalid";
      result.resultcode = 6;
      result.subresult = "typo_detected";
      result.didyoumean = suggestion;

      return result;

    }

    const mxRecords = await dns.resolveMx(domain);

    result.mxRecords = mxRecords.map(mx => mx.exchange);

    const mxHost = mxRecords[0].exchange;

    if (process.env.NODE_ENV === "test") {

      result.result = "unknown";
      result.resultcode = 3;
      result.subresult = "smtp_skipped_for_test";

    } else {

      await checkSMTP(mxHost, email, result);

    }

  } catch (err) {

    result.result = "unknown";
    result.resultcode = 3;
    result.subresult = "connection_error";
    result.error = err.message;

  }

  result.executiontime = (Date.now() - start) / 1000;

  return result;

}

function checkSMTP(host, email, result) {

  return new Promise((resolve) => {

    const socket = net.createConnection({
      host: host,
      port: 25
    });

    socket.setTimeout(3000);

    socket.on("data", (data) => {

      const msg = data.toString();

      if (msg.includes("220")) {
        socket.write("HELO test.com\r\n");
      }

      if (msg.includes("250")) {
        socket.write("MAIL FROM:<test@test.com>\r\n");
        socket.write(`RCPT TO:<${email}>\r\n`);
      }

      if (msg.includes("550")) {

        result.result = "invalid";
        result.resultcode = 6;
        result.subresult = "mailbox_does_not_exist";

        socket.end();
        resolve();

      }

      if (msg.includes("250")) {

        result.result = "valid";
        result.resultcode = 1;
        result.subresult = "mailbox_exists";

        socket.end();
        resolve();

      }

    });

    socket.on("timeout", () => {

      result.result = "unknown";
      result.resultcode = 3;
      result.subresult = "timeout";

      socket.destroy();
      resolve();

    });

    socket.on("error", () => {

      result.result = "unknown";
      result.resultcode = 3;
      result.subresult = "connection_error";

      resolve();

    });

  });

}

module.exports = { verifyEmail };