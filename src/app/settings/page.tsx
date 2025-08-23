'use client';
import SettingsForm from '@/components/SettingsForm';

export default function SettingsPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Configurações</h1>
      <SettingsForm />
    </main>
  );
}
