const extractTotalAmount = (text) => {
    if (!text) {
        return null;
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const totalKeywords = [
        "grand total",
        "total amount",
        "amount due",
        "net amount",
        "total",
    ];

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        const containsTotalKeyword = totalKeywords.some(
            (keyword) => lowerLine.includes(keyword)
        );

        if (!containsTotalKeyword) {
            continue;
        }

        const matches = line.match(
            /(?:₹|rs\.?|inr)?\s*(\d+(?:[.,]\d{1,2})?)/i
        );

        if (matches) {
            const amount = parseFloat(
                matches[1].replace(",", "")
            );

            if (!Number.isNaN(amount)) {
                return amount;
            }
        }
    }

    return null;
};

module.exports = {
    extractTotalAmount,
};