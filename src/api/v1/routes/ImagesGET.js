class ImagesGET {
  constructor(controller) {
    this.path = '/info/:id';
    this.router = controller.router;
    this.database = controller.database;

    this.router.get(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    let image = await this.database.Image.findOne({ id: req.params.id }).select('-_id -__v').lean().exec();

    if (!image)
      return res.status(404).send({ message: 'Imágen no encontrada.' });

    return res.status(200).send({ image });
  }
}

module.exports = ImagesGET;