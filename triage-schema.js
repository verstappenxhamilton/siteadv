const { z } = require('zod');

const triageSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  descricaoCaso: z.string().min(1),
  prazos: z.string().optional(),
  risco: z.string().optional(),
  documentos: z.array(z.string()).optional()
});

module.exports = { triageSchema };
