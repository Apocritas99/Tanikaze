class ImageRandomGET {
  constructor(controller) {
    this.path = '/images/random';
    this.router = controller.router;
    this.database = controller.database;

    this.router.get(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    const agg = this.database.Image.aggregate().cursor({});

    if (req.query.nsfw === undefined || req.query.nsfw === 'false')
      req.query.nsfw = false;

    if (req.query.nsfw === 'true')
      req.query.nsfw = true;

    agg.match({'type': req.query.type, 'nsfw': req.query.nsfw});
    agg.sample(1);

    const images = await this.handleCursor(agg.exec());

    return res.status(200).send(images[0]);
  }

  handleCursor(cursor) {
    let data = [];

    return new Promise(resolve => {
      cursor.on('data', d => {
        delete d._id;
        delete d.__v;
        data.push(d);
      }).once('end', () => resolve(data));
    });
  }
}

module.exports = ImageRandomGET;