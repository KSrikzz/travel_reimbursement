const extractTotalAmount = (text) => {
    if (!text) {
        return null;
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const priorityKeywords = [
        "grand total",
        "total amount",
        "net amount",
        "amount due",
        "final total",
    ];

    const fallbackKeywords = [
        "total",
        "subtotal",
        "sub total",
    ];

    const ignoreKeywords = [
        "total items",
        "items total",
        "item total",
        "total qty",
        "qty total",
        "total savings",
        "total tax",
        "discount",
    ];

    let fallbackAmount = null;

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Skip non-financial total lines
        if (ignoreKeywords.some((ign) => lowerLine.includes(ign))) {
            continue;
        }

        const isPriority = priorityKeywords.some((kw) => lowerLine.includes(kw));
        const isFallback = fallbackKeywords.some((kw) => lowerLine.includes(kw));

        if (!isPriority && !isFallback) {
            continue;
        }

        // Look for currency amounts, e.g. 1,349.00 or 1349.00 or 1349
        const amounts = [...line.matchAll(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi)];
        if (amounts.length > 0) {
            // Pick the last number on the total line as it typically represents the column total
            const lastMatch = amounts[amounts.length - 1];
            const parsed = parseFloat(lastMatch[1].replace(/,/g, ""));

            if (!Number.isNaN(parsed) && parsed > 0) {
                if (isPriority) {
                    return parsed;
                }
                if (fallbackAmount === null) {
                    fallbackAmount = parsed;
                }
            }
        }
    }

    return fallbackAmount;
};

module.exports = {
    extractTotalAmount,
};