function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

class ImageSearchPOST {
  constructor(controller) {
    this.path = '/images/search';
    this.router = controller.router;
    this.database = controller.database;

    this.router.post(
      this.path,
      this.run.bind(this)
    );
  }

  async run(req, res) {
    if (!req.body)
      return res.status(400).send({ message: 'Sin body' });

    if (req.body.id) {
      return res.status(200).send({
        images: await this.database.Image.find({ id: req.body.id }).select('-_id -__v').lean().exec()
      });
    }

    let options = {},
      projection = { '_id': 0, '__v': 0 },
      sort = {};

    if (req.body.nsfw !== undefined)
      options.nsfw = req.body.nsfw;

    if (req.body.artist) {
      options.artist = new RegExp(`(?:\\(|^)${escapeRegExp(req.body.artist)} *(?:\\)|$|\\(|)`, 'i');
    }

    if (Array.isArray(req.body.tags))
      req.body.tags = req.body.tags.join(', ');

    if (req.body.tags !== undefined && req.body.tags.trim() !== '') {
      if (req.body.tags.split(/-"?[^",]+"?(?:, *)?/).join('').trim() === '') {
        options.tags = {
          $nin: req.body.tags.match(/(^|, *)-[^,]+/g).map(e => e.replace(/,? *-|"/g, ''))
        };
      } else {
        options.$text = { $search: req.body.tags };

        if (req.body.sort && req.body.sort === 'relevance') {
          projection.score = { $meta: 'textScore' };
          sort.score = { $meta: 'textScore' };
        }
      }
    }

    if (req.body.sort && req.body.sort !== 'relevance') {
      if (req.body.sort === 'oldest')
        sort.createdAt = 1;
      else if (req.body.sort === 'likes') {
        sort.likes = -1;
        sort.createdAt = -1;
      } else
        sort.createdAt = -1;
    }

    let query = this.database.Image.find(options).sort(sort);
    if (req.body.posted_before !== undefined)
      query.lt('createdAt', req.body.posted_before);
    if (req.body.posted_after !== undefined)
      query.gt('createdAt', req.body.posted_after);
    if (typeof req.body.skip === 'number' && req.body.skip >= 0) {
      if (req.body.skip > 2500)
        return res.status(400).send({ message: 'No se puede saltar más de 2500 imágenes.' });

      query.skip(req.body.skip);
    }

    let limit = typeof req.body.limit === 'number' && req.body.limit <= 50 ? req.body.limit : 20;

    return res.status(200).send({
      images: await query.select(projection).limit(limit).lean().exec()
    });
  }
}

module.exports = ImageSearchPOST;