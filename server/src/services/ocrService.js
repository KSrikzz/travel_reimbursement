const { createWorker } = require("tesseract.js");
const path = require("path");

const languageDataPath = path.resolve(
    __dirname,
    "../../data/tesseract"
);

const extractTextFromImage = async (imageBuffer) => {
    const worker = await createWorker("eng", 1, {
        langPath: languageDataPath,
        cachePath: languageDataPath,
        gzip: false,
        cacheMethod: "readOnly",
    });

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
