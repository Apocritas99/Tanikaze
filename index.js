const settings = require('./settings.json');

const Tanikaze = require('./src/Tanikaze');
const tanikaze = new Tanikaze(settings);
tanikaze.listen();