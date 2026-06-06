exports.validateFootwearImages = (req, res, next) => {
  const { images } = req.body;
  if (!images || !Array.isArray(images)) return next();

  if (images.length > 5) {
    return res.status(400).json({ message: "Payload constraint violated: Maximum 5 asset images permitted per SKU variant." });
  }

  for (let i = 0; i < images.length; i++) {
    const stringSizeInBytes = Buffer.byteLength(images[i], 'utf8');
    const sizeInMB = stringSizeInBytes / (1024 * 1024);
    if (sizeInMB > 1.0) {
      return res.status(400).json({ message: `Image file index [${i}] exceeds structural limitations. Maximum file size budget allocation is 1MB.` });
    }
  }
  next();
};