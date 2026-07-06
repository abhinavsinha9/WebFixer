const JsonModel = require('./jsonModel');

class ReportModel extends JsonModel {
  constructor() {
    super('Report');
  }
  async create(data) {
    data.format = data.format || 'pdf';
    data.status = data.status || 'generating';
    data.fileUrl = data.fileUrl || '';
    data.fileSize = data.fileSize || 0;
    data.downloadCount = data.downloadCount || 0;
    data.data = data.data || {};
    return super.create(data);
  }
}

class NotificationModel extends JsonModel {
  constructor() {
    super('Notification');
  }
  async create(data) {
    data.type = data.type || 'info';
    data.link = data.link || '';
    data.read = data.read || false;
    return super.create(data);
  }
}

class ActivityModel extends JsonModel {
  constructor() {
    super('Activity');
  }
  async create(data) {
    data.description = data.description || '';
    data.metadata = data.metadata || {};
    return super.create(data);
  }
}

const Report = new ReportModel();
const Notification = new NotificationModel();
const Activity = new ActivityModel();

module.exports = Report;
module.exports.Notification = Notification;
module.exports.Activity = Activity;
