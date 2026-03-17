const { verifyEmail } = require("./emailVerifier");

describe("Email Syntax Tests", () => {

  test("valid email", async () => {

    const res = await verifyEmail("test@gmail.com");

    expect(res.email).toBe("test@gmail.com");

  });

  test("missing @", async () => {

    const res = await verifyEmail("testgmail.com");

    expect(res.result).toBe("invalid");

  });

  test("double dot", async () => {

    const res = await verifyEmail("test..mail@gmail.com");

    expect(res.result).toBe("invalid");

  });

  test("multiple @", async () => {

    const res = await verifyEmail("test@@gmail.com");

    expect(res.result).toBe("invalid");

  });

});

describe("Edge Cases", () => {

  test("empty string", async () => {

    const res = await verifyEmail("");

    expect(res.result).toBe("invalid");

  });

  test("null email", async () => {

    const res = await verifyEmail(null);

    expect(res.result).toBe("invalid");

  });

  test("long email", async () => {

    const email = "a".repeat(100) + "@gmail.com";

    const res = await verifyEmail(email);

    expect(res.email).toBe(email);

  });

});

describe("Typo Detection", () => {

  test("gmial typo", async () => {

    const res = await verifyEmail("user@gmial.com");

    expect(res.didyoumean).toBe("user@gmail.com");

  });

  test("yahooo typo", async () => {

    const res = await verifyEmail("user@yahooo.com");

    expect(res.didyoumean).toBe("user@yahoo.com");

  });

});

describe("SMTP Error Handling", () => {

  test("connection error", async () => {

    const res = await verifyEmail("user@invalid-domain-xyz.com");

    expect(res.result).toBe("unknown");

  });

});