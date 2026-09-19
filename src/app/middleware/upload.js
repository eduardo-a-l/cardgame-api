const multer = require("multer");
const path = require("path");

const armazenamento = multer.diskStorage({
    destination: function(request, file, callback)
    {
        callback(null, "uploads/perfis");
    },

    filename: function(request, file, callback)
    {
        const extensao = path.extname(file.originalname);
        const nomeArquivo = "usuario-" + request.params.id + extensao;

        callback(null, nomeArquivo);
    }
});

const upload = multer({
    storage: armazenamento,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function(request, file, callback)
    {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (tiposPermitidos.includes(file.mimetype))
        {
            callback(null, true);
        }
        else
        {
            callback(new Error("Apenas imagens JPG, PNG ou WEBP são permitidas"));
        }
    }
});

module.exports = upload;