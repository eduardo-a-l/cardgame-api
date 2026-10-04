const multer = require("multer");

const armazenamento = multer.memoryStorage();

const upload = multer({
    storage: armazenamento,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (request, file, callback) {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(
                new Error("Apenas imagens JPG, PNG ou WEBP são permitidas")
            );
        }
    }
});

module.exports = upload;