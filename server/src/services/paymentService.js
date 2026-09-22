const crypto = require("crypto");

const generateTransactionId = () => {
    const randomId = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `MOCK-TXN-${randomId}`;
};

module.exports = {
    generateTransactionId,
};