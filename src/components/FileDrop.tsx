import { UIControl } from './SlotForm';

interface FileDropProps {
  control: Extract<UIControl, { type: 'file' }>;
  onChange: (files: File[]) => void;
}

export default function FileDrop({ control, onChange }: FileDropProps) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onChange(files);
  };
  return (
    <label className="flex flex-col">
      {control.label}
      <input
        type="file"
        accept={control.accept.map(a => `.${a}`).join(',')}
        multiple={control.maxFiles > 1}
        required={control.required}
        onChange={handle}
        className="border p-1"
      />
    </label>
  );
}
