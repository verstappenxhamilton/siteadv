const openai = require('./openai');
const anthropic = require('./anthropic');
const groq = require('./groq');

function getProviderModule(name) {
  switch (name) {
    case 'anthropic':
      return anthropic;
    case 'groq':
      return groq;
    default:
      return openai;
  }
}

async function generate(providerName, cfg, messages) {
  const mod = getProviderModule(providerName);
  return mod.generate(cfg, messages);
}

module.exports = { generate };
