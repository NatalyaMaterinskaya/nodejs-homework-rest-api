const jimp = require("jimp");

const resizeFile = async (filePath) => {
  try {
    const image = await jimp.read(filePath);
     image
       .resize(250, 250)
       .write(filePath);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = resizeFile;