const { version } = require('../../../../package.json');

class HomeGET {
  constructor(controller) {
    this.path = '/';
    this.router = controller.router;
    this.database = controller.database;

    this.router.get(this.path, this.run.bind(this));
  }

  async run(req, res) {
    const count = await this.database.Image.estimatedDocumentCount();
    return res.status(200).json({
      version: version,
      message: 'Bienvenido a Tanikaze, tu servicio de weebs.',
      images: count,
      status: 200
    });
  }
}

module.exports = HomeGET;