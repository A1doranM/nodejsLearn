const multer = require("multer");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "images");
    },
    filename(req, file, cb) {
        cb(null, new Date().toISOString() + "-" + file.originalname);
    },
});

const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
];

const fileFilter = (req, file, cb) => {
    if(allowedTypes.includes(file.mimeType)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
});