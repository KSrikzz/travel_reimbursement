const { createWorker } = require("tesseract.js");

const extractTextFromImage = async (imageBuffer) => {
    const worker = await createWorker("eng");

    try {
        const {
            data: { text },
        } = await worker.recognize(imageBuffer);

        return text;
    } finally {
        await worker.terminate();
    }
};

module.exports = {
    extractTextFromImage,
};