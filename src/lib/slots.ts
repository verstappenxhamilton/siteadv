export interface Slot {
  id: string;
  label: string;
}

export const slotsPorArea: Record<string, Slot[]> = {
  consumidor: [
    { id: 'nome', label: 'Nome' },
    { id: 'email', label: 'Email' },
  ],
};
