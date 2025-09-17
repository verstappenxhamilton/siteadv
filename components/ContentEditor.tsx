
import React, { useState, useEffect } from 'react';

const ContentEditor: React.FC = () => {
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        fetch('/api/content')
            .then(res => res.json())
            .then(data => setContent(data));
    }, []);

    const handleSave = () => {
        fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        }).then(() => alert('Conteúdo salvo!'));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            let current = content;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            setContent({ ...content });
        } else {
            setContent({ ...content, [name]: value });
        }
    };

    if (!content) return <div>Carregando...</div>;

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold mb-4">Editor de Conteúdo</h2>
            <div className="space-y-4">
                <details>
                    <summary>Seção Hero</summary>
                    <div className="p-4">
                        <label className="block mb-2">Título</label>
                        <input type="text" name="hero.title" value={content.hero.title} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label className="block mt-4 mb-2">Subtítulo</label>
                        <input type="text" name="hero.subtitle" value={content.hero.subtitle} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                </details>
                {/* Add more sections here */}
            </div>
            <div className="mt-4">
                <button onClick={handleSave} className="bg-[#B98F58] hover:bg-[#a37d4b] text-white font-bold py-2 px-4 rounded">
                    Salvar Conteúdo
                </button>
            </div>
        </div>
    );
};

export default ContentEditor;
