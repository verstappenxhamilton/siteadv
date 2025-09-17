
import React, { useEffect, useMemo, useState } from 'react';

type Provider = 'openai' | 'anthropic' | 'groq' | 'gemini';

const DEFAULT_MODELS: Record<Provider, string> = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    groq: 'mixtral-8x7b-32768',
    gemini: 'gemini-2.0-flash'
};

const providerLabels: Record<Provider, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    groq: 'Groq',
    gemini: 'Gemini'
};

const AIConfig: React.FC = () => {
    const [config, setConfig] = useState<any | null>(null);
    const [keys, setKeys] = useState<any | null>(null);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isSavingKeys, setIsSavingKeys] = useState(false);
    const selectedProvider: Provider = (config?.provider as Provider) || 'openai';

    useEffect(() => {
        const load = async () => {
            try {
                const [configResponse, keysResponse] = await Promise.all([
                    fetch('/admin/config'),
                    fetch('/admin/keys')
                ]);
                const configData = await configResponse.json();
                const keysData = await keysResponse.json();
                setConfig(configData);
                setKeys(keysData);
            } catch (error) {
                console.error('Failed to load AI config', error);
            }
        };
        void load();
    }, []);

    const modelPlaceholder = useMemo(() => DEFAULT_MODELS[selectedProvider], [selectedProvider]);

    const handleProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const provider = event.target.value as Provider;
        setConfig((prev: any) => ({
            ...prev,
            provider,
            parameters: {
                ...prev.parameters,
                model: prev.parameters.model || DEFAULT_MODELS[provider]
            }
        }));
    };

    const handleConfigChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;
        if (name.startsWith('parameters.')) {
            const field = name.replace('parameters.', '');
            const parsedValue = type === 'number' ? Number(value) : value;
            setConfig((prev: any) => ({
                ...prev,
                parameters: {
                    ...prev.parameters,
                    [field]: parsedValue
                }
            }));
        } else {
            setConfig((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        setConfig((prev: any) => ({ ...prev, prompt: value }));
    };

    const handleKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setKeys((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSaveConfig = async () => {
        if (!config) return;
        setIsSavingConfig(true);
        try {
            await fetch('/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            alert('Configuração salva com sucesso!');
        } catch (error) {
            console.error('Failed to save config', error);
            alert('Erro ao salvar configuração.');
        } finally {
            setIsSavingConfig(false);
        }
    };

    const handleSaveKeys = async () => {
        if (!keys) return;
        setIsSavingKeys(true);
        try {
            await fetch('/admin/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(keys)
            });
            alert('Chaves atualizadas!');
        } catch (error) {
            console.error('Failed to save keys', error);
            alert('Erro ao salvar chaves.');
        } finally {
            setIsSavingKeys(false);
        }
    };

    if (!config || !keys) {
        return (
            <section className="bg-gray-800 rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold">Configurações de IA</h2>
                <p className="text-sm text-gray-300 mt-2">Carregando configurações...</p>
            </section>
        );
    }

    return (
        <section className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Configurações de IA</h2>
                    <p className="text-sm text-gray-300">Defina o provedor, modelo e parâmetros utilizados pela secretária virtual.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <fieldset className="border border-gray-700 rounded-lg p-4 space-y-3">
                        <legend className="px-2 text-sm font-semibold">Provedor</legend>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(providerLabels) as Provider[]).map(provider => (
                                <label key={provider} className={`flex items-center gap-2 rounded border px-3 py-2 text-sm cursor-pointer ${selectedProvider === provider ? 'border-[#B98F58] bg-gray-900' : 'border-gray-700 hover:bg-gray-900/60'}`}>
                                    <input
                                        type="radio"
                                        name="provider"
                                        value={provider}
                                        checked={selectedProvider === provider}
                                        onChange={handleProviderChange}
                                    />
                                    {providerLabels[provider]}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <div className="grid grid-cols-1 gap-4">
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Modelo</span>
                            <input
                                type="text"
                                name="parameters.model"
                                value={config.parameters.model || ''}
                                placeholder={modelPlaceholder}
                                onChange={handleConfigChange}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className="text-sm">
                                <span className="block text-gray-300 mb-1">Max tokens</span>
                                <input
                                    type="number"
                                    name="parameters.max_output_tokens"
                                    value={config.parameters.max_output_tokens || 0}
                                    onChange={handleConfigChange}
                                    className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                />
                            </label>
                            <label className="text-sm">
                                <span className="block text-gray-300 mb-1">Temperature</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="parameters.temperature"
                                    value={config.parameters.temperature ?? 0}
                                    onChange={handleConfigChange}
                                    className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                />
                            </label>
                            <label className="text-sm">
                                <span className="block text-gray-300 mb-1">Top P</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="parameters.top_p"
                                    value={config.parameters.top_p ?? 1}
                                    onChange={handleConfigChange}
                                    className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <label className="text-sm block">
                    <span className="block text-gray-300 mb-1">Prompt de sistema</span>
                    <textarea
                        name="prompt"
                        value={config.prompt || ''}
                        onChange={handlePromptChange}
                        rows={6}
                        className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                    />
                </label>
                <button
                    onClick={handleSaveConfig}
                    className="inline-flex items-center px-4 py-2 rounded bg-[#B98F58] hover:bg-[#a37d4b] font-semibold"
                    disabled={isSavingConfig}
                >
                    {isSavingConfig ? 'Salvando...' : 'Salvar configuração'}
                </button>
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Chaves de API</h3>
                    <p className="text-sm text-gray-300">Mantenha as chaves em sigilo. Elas são utilizadas pelo chatbot e relatórios automatizados.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(providerLabels) as Provider[]).map(provider => (
                        <label key={provider} className="text-sm">
                            <span className="block text-gray-300 mb-1">{providerLabels[provider]}</span>
                            <input
                                type="password"
                                name={provider}
                                value={keys[provider] || ''}
                                placeholder={`Chave da ${providerLabels[provider]}`}
                                onChange={handleKeysChange}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleSaveKeys}
                    className="inline-flex items-center px-4 py-2 rounded bg-[#B98F58] hover:bg-[#a37d4b] font-semibold"
                    disabled={isSavingKeys}
                >
                    {isSavingKeys ? 'Salvando...' : 'Salvar chaves'}
                </button>
            </div>
        </section>
    );
};

export default AIConfig;
