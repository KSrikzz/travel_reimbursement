const { createWorker } = require("tesseract.js");
const path = require("path");
const fs = require("fs");
const os = require("os");

const localLanguageDataPath = path.resolve(
    __dirname,
    "../../data/tesseract"
);

const extractTextFromImage = async (imageBuffer, timeoutMs = 8000) => {
    let worker = null;

    const ocrTask = async () => {
        const localTrainedData = path.join(
            localLanguageDataPath,
            "eng.traineddata"
        );
        const hasLocalLangData = fs.existsSync(localTrainedData);

        const workerOptions = hasLocalLangData
            ? {
                  langPath: localLanguageDataPath,
                  cachePath: localLanguageDataPath,
                  gzip: false,
                  cacheMethod: "readOnly",
                  errorHandler: (err) => {
                      console.warn("Tesseract worker non-fatal warning:", err);
                  },
              }
            : {
                  cachePath: os.tmpdir(),
                  errorHandler: (err) => {
                      console.warn("Tesseract worker non-fatal warning:", err);
                  },
              };

        worker = await createWorker("eng", 1, workerOptions);

        const {
            data: { text },
        } = await worker.recognize(imageBuffer);

        return text;
    };

    const timeoutTask = new Promise((_, reject) => {
        setTimeout(
            () => reject(new Error("OCR extraction timed out")),
            timeoutMs
        );
    });

    try {
        return await Promise.race([ocrTask(), timeoutTask]);
    } finally {
        if (worker) {
            try {
                await worker.terminate();
            } catch (err) {
                // Ignore worker termination errors during cleanup
            }
        }
    }
};

module.exports = {
    extractTextFromImage,
};
