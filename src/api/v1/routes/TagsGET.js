class TagsGET {
  constructor(controller) {
    this.path = '/images/tags';
    this.router = controller.router;
    this.database = controller.database;

    this.router.get(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    let options = {};
    if (req.query.nsfw === 'true')
      options.nsfw = true;
    else if (req.query.nsfw === 'false')
      options.nsfw = false;

    return res.status(200).send({ options, tags: await this.database.Image.distinct('tags', options) });
  }
}

module.exports = TagsGET;