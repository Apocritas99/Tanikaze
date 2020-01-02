const { version } = require('../../../../package.json');

class HomeGET {
  constructor(controller) {
    this.path = '/';
    this.router = controller.router;
    this.database = controller.database;

    this.router.get(this.path, this.run.bind(this));
  }

  async run(req, res) {
    return res.status(200).json({
      version: version,
      message: 'Bienvenido a Tanikaze, tu servicio de weebs.',
      status: 200
    });
  }
}

module.exports = HomeGET;