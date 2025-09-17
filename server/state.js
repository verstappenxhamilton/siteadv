const sessions = Object.create(null);
const intakes = Object.create(null);
const reports = [];

const realtime = {
  lawyerSocket: null,
  busyWithClientId: null
};

module.exports = {
  sessions,
  intakes,
  reports,
  realtime
};
