import { UIControl } from '@/components/SlotForm';

export type SlotDefinition = UIControl;

export const baseSlots: SlotDefinition[] = [
  { id: 'nome', label: 'Nome', type: 'text_short', required: true },
  { id: 'email', label: 'Email', type: 'text_short', required: true },
  { id: 'telefone', label: 'Telefone', type: 'text_short', required: true },
  { id: 'cidade', label: 'Cidade', type: 'text_short', required: true },
  { id: 'UF', label: 'UF', type: 'text_short', required: true },
];

export const areaSlots: Record<string, SlotDefinition[]> = {
  consumidor: [
    { id: 'area', label: 'Área', type: 'select', options: ['consumidor'], required: true },
    { id: 'descricao_fatos', label: 'Descrição dos fatos', type: 'text_long', required: true }
  ],
  civel: [],
  familia: [],
  previdenciario: [],
  imobiliario: []
};
