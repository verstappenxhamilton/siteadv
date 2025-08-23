const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config', 'config.json');

function readConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeConfig(newConfig) {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
}

module.exports = {
  getConfig: readConfig,
  updateConfig: writeConfig
};
