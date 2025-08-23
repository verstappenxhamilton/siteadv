'use client';

interface Props {
  onFiles: (files: File[]) => void;
}

export default function FileDropzone({ onFiles }: Props) {
  return (
    <input
      type="file"
      multiple
      onChange={e => {
        const files = Array.from(e.target.files || []);
        onFiles(files);
      }}
    />
  );
}
