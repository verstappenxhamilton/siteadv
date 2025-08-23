import SettingsForm from '@/components/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <SettingsForm />
    </div>
  );
}
