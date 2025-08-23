'use client';

interface Props {
  onFiles: (files: FileList) => void;
}

export default function FileDrop({ onFiles }: Props) {
  return (
    <input
      type="file"
      multiple
      onChange={(e) => e.target.files && onFiles(e.target.files)}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
  );
}
