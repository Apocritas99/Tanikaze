const AWS = require('aws-sdk');
const Logger = require('./TanikazeLog');

class TanikazeBucket {
  constructor(settings) {
    this.settings = settings;

    this.s3 = new AWS.S3({
      accessKeyId: this.settings.userKey,
      secretAccessKey: this.settings.userSecret,
      Bucket: this.settings.bucketName
    });
  }

  uploadToS3(file, mimeType) {
    const params = {
      Bucket: this.settings.bucketName,
      Key: 'images/' + file.name,
      ContentType: mimeType,
      Body: file.data
    };

    this.s3.upload(params, (err, data) => {
      if (err) {
        Logger.log('Error in callback');
        Logger.error(err);
      }
      Logger.log(`File uploaded successfully. ${data.Location}`);
    });
  }

  deleteFromS3(image) {
    const params = {
      Bucket: this.settings.bucketName,
      Key: `images/${image.id}.${image.fileType}`
    };

    this.s3.deleteObject(params, (err, data) => {
      if (err) {
        Logger.log('Error in callback');
        Logger.error(err);
      }
      Logger.log(`Success deleting file from AWS S3. ${data.Location}`);
    });
  }
}

module.exports = TanikazeBucket;