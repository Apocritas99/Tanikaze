const AWS = require('aws-sdk');
const TanikazeBucket = require('../../../misc/TanikazeBucket');

class ImagesDELETE {
  constructor(controller) {
    this.path = '/info/:id';
    this.router = controller.router;
    this.database = controller.database;

    this.tanikazeBucket = new TanikazeBucket(controller.tanikaze.settings.aws);

    this.router.delete(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    let image = await this.database.Image.findOne({ id: req.params.id });
    if (!image)
      return res.status(404).send({ message: 'No se encontró la imagen' });

    await image.remove();
    this.tanikazeBucket.deleteFromS3(image);

    return res.sendStatus(204);
  }
}

module.exports = ImagesDELETE;