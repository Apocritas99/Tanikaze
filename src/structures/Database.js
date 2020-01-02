const Mongoose = require('mongoose');

Mongoose.Promise = global.Promise;
Mongoose.set('useUnifiedTopology', true);
Mongoose.set('useCreateIndex', true);

const imageSchema = new Mongoose.Schema({
  id: { type: String, unique: true, index: { unique: true }, required: true },
  type: { type: String, required: true },
  nsfw: { type: Boolean, default: false },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  tags: [String],
  url: { type: String, required: true },
  source: { type: String },
  originalHash: { type: String, unique: true, index: { unique: true }, select: false },
  createdAt: { type: Date, default: Date.now, required: true }
});

imageSchema.index({ tags: 'text' }, { default_language: 'none' });

class Database {
  constructor(tanikaze) {
    this.app = tanikaze.app;
    this.settings = tanikaze.settings.mongo;
    this.logger = tanikaze.logger;
  }

  build() {
    this.connection = Mongoose.createConnection(`mongodb+srv://${this.settings.host}/${this.settings.db}`, {
      user: this.settings.user,
      pass: this.settings.pass,
      useNewUrlParser: true
    });
    
    this.Image = this.connection.model('Image', imageSchema);

    this.connection.on('error', console.error.bind(console, 'Mongoose error:'));
    this.connection.on('open', () => {
      this.logger.log(`Connected to the database @ ${this.connection.db.databaseName}`);
      this.app.emit('dbReady');
    });
  }
}

module.exports = Database;