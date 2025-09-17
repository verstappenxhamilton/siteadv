
import React, { useState, useEffect } from 'react';

const AIConfig: React.FC = () => {
    const [config, setConfig] = useState<any>(null);
    const [keys, setKeys] = useState<any>(null);

    useEffect(() => {
        fetch('/admin/config')
            .then(res => res.json())
            .then(data => setConfig(data));
        fetch('/admin/keys')
            .then(res => res.json())
            .then(data => setKeys(data));
    }, []);

    const handleSaveConfig = () => {
        fetch('/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        }).then(() => alert('Configuração salva!'));
    };

    const handleSaveKeys = () => {
        fetch('/admin/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keys)
        }).then(() => alert('Chaves salvas!'));
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');
        if (nameParts.length > 1) {
            setConfig((prev: any) => ({
                ...prev,
                [nameParts[0]]: {
                    ...prev[nameParts[0]],
                    [nameParts[1]]: value
                }
            }));
        } else {
            setConfig((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setKeys((prev: any) => ({ ...prev, [name]: value }));
    };

    if (!config || !keys) return <div>Carregando...</div>;

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold mb-4">Configuração da IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2">Provedor</label>
                    <select name="provider" value={config.provider} onChange={handleConfigChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="groq">Groq</option>
                        <option value="gemini">Gemini</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2">Modelo</label>
                    <input type="text" name="parameters.model" value={config.parameters.model} onChange={handleConfigChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block mb-2">Max Tokens</label>
                    <input type="number" name="parameters.max_output_tokens" value={config.parameters.max_output_tokens} onChange={handleConfigChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block mb-2">Temperatura</label>
                    <input type="number" step="0.1" name="parameters.temperature" value={config.parameters.temperature} onChange={handleConfigChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
            </div>
            <div className="mt-4">
                <label className="block mb-2">Prompt</label>
                <textarea name="prompt" value={config.prompt} onChange={handleConfigChange} rows={5} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"></textarea>
            </div>
            <div className="mt-4">
                <button onClick={handleSaveConfig} className="bg-[#B98F58] hover:bg-[#a37d4b] text-white font-bold py-2 px-4 rounded">
                    Salvar Configuração
                </button>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Chaves de API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">OpenAI</label>
                        <input type="password" name="openai" value={keys.openai} onChange={handleKeyChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block mb-2">Anthropic</label>
                        <input type="password" name="anthropic" value={keys.anthropic} onChange={handleKeyChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block mb-2">Groq</label>
                        <input type="password" name="groq" value={keys.groq} onChange={handleKeyChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block mb-2">Gemini</label>
                        <input type="password" name="gemini" value={keys.gemini} onChange={handleKeyChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={handleSaveKeys} className="bg-[#B98F58] hover:bg-[#a37d4b] text-white font-bold py-2 px-4 rounded">
                        Salvar Chaves
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIConfig;
