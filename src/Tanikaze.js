const express = require('express');
const fileUpload = require ('express-fileupload');
const APIv1 = require('./api/v1/Router');
const Database = require('./structures/Database');
const TanikazeLog = require('./misc/TanikazeLog');

class Tanikaze {
  constructor(settings) {
    this.app = express();
    this.settings = settings;
    this.logger = TanikazeLog;
    this.db = new Database(this);

    this.db.build();
  }

  listen() {
    this.app.on('dbReady', () => {
      const api = new APIv1(this);
      api.build();
      this.app.use(express.json());
      this.app.use(fileUpload());
      this.app.use(api.path, api.router);

      this.app.set('port', 8001);

      this.app.listen(this.app.get('port'), () => {
        this.logger.success(`Success. Tanikaze is now online! Configured to listen @ port: ${this.app.get('port')}`);
      });
    });
  }
}

module.exports = Tanikaze;