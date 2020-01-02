const shortid = require('shortid');
const TanikazeBucket = require('../../../misc/TanikazeBucket');

class ImagesPOST {
  constructor(controller) {
    this.path = '/images/upload';
    this.router = controller.router;
    this.database = controller.database;

    this.tanikazeBucket = new TanikazeBucket(controller.tanikaze.settings.aws);

    this.router.post(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    if (!req.files || !req.files.image)
      return res.status(400).send({ message: 'No se encontró una imagen adjunta.' });

    if (!req.body || !req.body.type || !req.body.tags)
      return res.status(400).send({ message: 'Faltan campos.' });

    if (!Array.isArray(req.body.tags)) {
      if (typeof req.body.tags !== 'string')
        return res.status(400).send({ message: 'Los tags deben ser un array de strings.' });

      req.body.tags = req.body.tags
        .replace(/( *,[ ,]*(\r|\n)*|\r+|\n+)/g, ',') // Quita los espacios extras
        .replace(/_+/g, ' ') // Reemplaza con espacios
        .replace(/(^,|,(?:,+|$))/g, '') // Remueve tags extras vacios
        .toLowerCase()
        .split(',');
    } else {
      req.body.tags = req.body.tags
        .filter(t => typeof t === 'string') // Filtra los que no son de tipo String
        .map(t => t.replace(/, *|_+| {2,}/g, ' ').toLowerCase()) // Reemplaza comas y remueve espacios extras
        .filter(t => t !== '' && t.trim() !== ''); // Remueve tags vacios
    }

    if (req.body.tags.length > 120)
      return res.status(400).send({ message: 'Un post solo puede tener hasta 120 tags.' });

    if (req.body.tags.find(t => t.length > 50))
      return res.status(400).send({ message: 'Los tags solo pueden tener hasta 50 carácteres.' });

    // Elimina los duplicados y ordena alfabéticamente.
    req.body.tags = [...new Set(req.body.tags)].sort((a, b) => a.localeCompare(b));

    let originalHash = req.files.image.md5;

    // Revisa si es un duplicado.
    const existing = await this.database.Image.findOne({ originalHash });
    if (existing)
      return res.status(409).send({
        message: 'La imagen ya ha sido subida.',
        id: existing.id
      });

    const id = shortid.generate();
    const fileType = req.files.image.name.split('.').pop();

    try {
      const image = await this.database.Image.create({
        id,
        originalHash,
        type: req.body.type,
        tags: req.body.tags ? req.body.tags : [],
        nsfw: req.body.nsfw ? req.body.nsfw : false,
        fileType,
        mimeType: req.files.image.mimetype,
        url: `https://cdn.weebs.cl/images/${id}.${fileType}`
      });

      if (!image)
        return res.status(500).send({ message: 'Ocurrió un problema al intentar guardar la imagen en la base de datos.' });

      const file = req.files.image;
      file.name = `${image.id}.${fileType}`
      this.tanikazeBucket.uploadToS3(file, image.mimeType);

      return res.status(201).send({
        image: {
          id: image.id,
          type: image.type,
          tags: image.tags,
          nsfw: image.nsfw,
          fileType: image.fileType,
          mimeType: image.mimeType,
          url: image.url,
          createdAt: image.createdAt
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: 'Error interno del servidor.' });
    }
  }
}

module.exports = ImagesPOST;