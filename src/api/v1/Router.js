const fs = require('fs');

class APIv1 {
  constructor(tanikaze) {
    this.router = require('express').Router();
    this.tanikaze = tanikaze;
    this.database = tanikaze.db;
    this.path = '/api/tanikaze/';
    this.routes = new Map();
    this.built = false;
  }

  build() {
    if (this.built) return;
    const routes = fs.readdirSync(__dirname + '/routes/');
    for (let route of routes) {
      route = new (require(__dirname + '/routes/' + route))(this);
      this.routes.set(route.path, route);
    }
    this.tanikaze.logger.log(`Loaded ${this.routes.size} API routes!`);
    this.built = true;
  }
}

module.exports = APIv1;