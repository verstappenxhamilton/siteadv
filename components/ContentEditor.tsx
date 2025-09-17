
import React, { useEffect, useMemo, useState } from 'react';

type AreaItem = { title: string; icon: string };
type SocialItem = { name: string; link: string; icon: string };

interface SiteContent {
    site: { title: string };
    nav: { about: string; areas: string; contact: string; lawyer: string };
    sections: {
        secretary: { title: string };
        contact: { title: string };
        form: { title: string };
    };
    hero: { title: string; subtitle: string; button: { text: string; link: string } };
    about: { title: string; text: string };
    areas: { title: string; items: AreaItem[] };
    footer: { text: string; social: SocialItem[] };
}

const defaultContent: SiteContent = {
    site: { title: '' },
    nav: { about: '', areas: '', contact: '', lawyer: '' },
    sections: {
        secretary: { title: '' },
        contact: { title: '' },
        form: { title: '' }
    },
    hero: { title: '', subtitle: '', button: { text: '', link: '' } },
    about: { title: '', text: '' },
    areas: { title: '', items: [] },
    footer: { text: '', social: [] }
};

const predefinedIcons = [
    'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z',
    'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z',
    'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z'
];

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const normalizeContent = (data: any): SiteContent => ({
    site: { title: data?.site?.title || '' },
    nav: {
        about: data?.nav?.about || '',
        areas: data?.nav?.areas || '',
        contact: data?.nav?.contact || '',
        lawyer: data?.nav?.lawyer || ''
    },
    sections: {
        secretary: { title: data?.sections?.secretary?.title || '' },
        contact: { title: data?.sections?.contact?.title || '' },
        form: { title: data?.sections?.form?.title || '' }
    },
    hero: {
        title: data?.hero?.title || '',
        subtitle: data?.hero?.subtitle || '',
        button: {
            text: data?.hero?.button?.text || '',
            link: data?.hero?.button?.link || ''
        }
    },
    about: {
        title: data?.about?.title || '',
        text: data?.about?.text || ''
    },
    areas: {
        title: data?.areas?.title || '',
        items: Array.isArray(data?.areas?.items)
            ? data.areas.items.map((item: any) => ({
                  title: item?.title || '',
                  icon: item?.icon || ''
              }))
            : []
    },
    footer: {
        text: data?.footer?.text || '',
        social: Array.isArray(data?.footer?.social)
            ? data.footer.social.map((item: any) => ({
                  name: item?.name || '',
                  link: item?.link || '',
                  icon: item?.icon || ''
              }))
            : []
    }
});

type SimpleField =
    | 'site.title'
    | 'nav.about'
    | 'nav.areas'
    | 'nav.contact'
    | 'nav.lawyer'
    | 'sections.secretary.title'
    | 'sections.contact.title'
    | 'sections.form.title'
    | 'hero.title'
    | 'hero.subtitle'
    | 'hero.button.text'
    | 'hero.button.link'
    | 'about.title'
    | 'about.text'
    | 'areas.title'
    | 'footer.text';

const ContentEditor: React.FC = () => {
    const [content, setContent] = useState<SiteContent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const response = await fetch('/api/content');
                if (!response.ok) throw new Error('failed');
                const data = await response.json();
                setContent(normalizeContent(data));
            } catch (error) {
                console.warn('Failed to load content, using defaults', error);
                setContent(defaultContent);
            }
        };
        void loadContent();
    }, []);

    const updateContent = (updater: (draft: SiteContent) => void) => {
        setContent(prev => {
            if (!prev) return prev;
            const draft = deepClone(prev);
            updater(draft);
            return draft;
        });
    };

    const handleSimpleChange = (field: SimpleField, value: string) => {
        updateContent(draft => {
            switch (field) {
                case 'site.title':
                    draft.site.title = value;
                    break;
                case 'nav.about':
                    draft.nav.about = value;
                    break;
                case 'nav.areas':
                    draft.nav.areas = value;
                    break;
                case 'nav.contact':
                    draft.nav.contact = value;
                    break;
                case 'nav.lawyer':
                    draft.nav.lawyer = value;
                    break;
                case 'sections.secretary.title':
                    draft.sections.secretary.title = value;
                    break;
                case 'sections.contact.title':
                    draft.sections.contact.title = value;
                    break;
                case 'sections.form.title':
                    draft.sections.form.title = value;
                    break;
                case 'hero.title':
                    draft.hero.title = value;
                    break;
                case 'hero.subtitle':
                    draft.hero.subtitle = value;
                    break;
                case 'hero.button.text':
                    draft.hero.button.text = value;
                    break;
                case 'hero.button.link':
                    draft.hero.button.link = value;
                    break;
                case 'about.title':
                    draft.about.title = value;
                    break;
                case 'about.text':
                    draft.about.text = value;
                    break;
                case 'areas.title':
                    draft.areas.title = value;
                    break;
                case 'footer.text':
                    draft.footer.text = value;
                    break;
                default:
                    break;
            }
        });
    };

    const handleAreaChange = (index: number, key: keyof AreaItem, value: string) => {
        updateContent(draft => {
            if (!draft.areas.items[index]) return;
            draft.areas.items[index][key] = value;
        });
    };

    const handleSocialChange = (index: number, key: keyof SocialItem, value: string) => {
        updateContent(draft => {
            if (!draft.footer.social[index]) return;
            draft.footer.social[index][key] = value;
        });
    };

    const addArea = () => {
        updateContent(draft => {
            draft.areas.items.push({ title: 'Nova área', icon: '' });
        });
    };

    const removeArea = (index: number) => {
        updateContent(draft => {
            draft.areas.items.splice(index, 1);
        });
    };

    const addSocial = () => {
        updateContent(draft => {
            draft.footer.social.push({ name: 'Nova rede', link: '', icon: '' });
        });
    };

    const removeSocial = (index: number) => {
        updateContent(draft => {
            draft.footer.social.splice(index, 1);
        });
    };

    const openIconPicker = (index: number) => {
        setIconPickerIndex(index);
    };

    const handleSelectIcon = (icon: string) => {
        if (iconPickerIndex === null) return;
        handleAreaChange(iconPickerIndex, 'icon', icon);
        setIconPickerIndex(null);
    };

    const renderIconPreview = (icon: string) => (
        <div className="h-10 w-10 flex items-center justify-center rounded bg-gray-900 border border-gray-700">
            {icon ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-6 w-6 text-[#B98F58]"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
            ) : (
                <span className="text-xs text-gray-500">?</span>
            )}
        </div>
    );

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!content) return;
        setIsSaving(true);
        try {
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            alert('Conteúdo salvo com sucesso!');
        } catch (error) {
            console.error('Failed to save content', error);
            alert('Erro ao salvar o conteúdo.');
        } finally {
            setIsSaving(false);
        }
    };

    const isIconPickerOpen = iconPickerIndex !== null;

    const modalTitle = useMemo(() => {
        if (iconPickerIndex === null || !content) return '';
        const area = content.areas.items[iconPickerIndex];
        return area ? `Selecione um ícone para "${area.title}"` : '';
    }, [iconPickerIndex, content]);

    if (!content) {
        return (
            <section className="bg-gray-800 rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold">Editor de Conteúdo</h2>
                <p className="text-sm text-gray-300 mt-2">Carregando dados do site...</p>
            </section>
        );
    }

    return (
        <section className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Editor de Conteúdo</h2>
                <p className="text-sm text-gray-300">Atualize textos, áreas de atuação e links exibidos na página principal.</p>
            </div>
            <form className="space-y-4" onSubmit={handleSave}>
                <details className="bg-gray-900 rounded-lg border border-gray-700" open>
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Configurações gerais</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Nome do site</span>
                            <input
                                type="text"
                                value={content.site.title}
                                onChange={event => handleSimpleChange('site.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Menu - Sobre</span>
                            <input
                                type="text"
                                value={content.nav.about}
                                onChange={event => handleSimpleChange('nav.about', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Menu - Áreas</span>
                            <input
                                type="text"
                                value={content.nav.areas}
                                onChange={event => handleSimpleChange('nav.areas', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Menu - Contato</span>
                            <input
                                type="text"
                                value={content.nav.contact}
                                onChange={event => handleSimpleChange('nav.contact', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Menu - Advogado</span>
                            <input
                                type="text"
                                value={content.nav.lawyer}
                                onChange={event => handleSimpleChange('nav.lawyer', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Título da seção Secretária</span>
                            <input
                                type="text"
                                value={content.sections.secretary.title}
                                onChange={event => handleSimpleChange('sections.secretary.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Título da seção Contato</span>
                            <input
                                type="text"
                                value={content.sections.contact.title}
                                onChange={event => handleSimpleChange('sections.contact.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Título do formulário</span>
                            <input
                                type="text"
                                value={content.sections.form.title}
                                onChange={event => handleSimpleChange('sections.form.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                    </div>
                </details>

                <details className="bg-gray-900 rounded-lg border border-gray-700" open>
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Seção Hero</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Título</span>
                            <input
                                type="text"
                                value={content.hero.title}
                                onChange={event => handleSimpleChange('hero.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Subtítulo</span>
                            <input
                                type="text"
                                value={content.hero.subtitle}
                                onChange={event => handleSimpleChange('hero.subtitle', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Texto do botão</span>
                            <input
                                type="text"
                                value={content.hero.button.text}
                                onChange={event => handleSimpleChange('hero.button.text', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Link do botão</span>
                            <input
                                type="text"
                                value={content.hero.button.link}
                                onChange={event => handleSimpleChange('hero.button.link', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                    </div>
                </details>

                <details className="bg-gray-900 rounded-lg border border-gray-700">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Seção Sobre</summary>
                    <div className="grid grid-cols-1 gap-4 px-4 pb-4">
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Título</span>
                            <input
                                type="text"
                                value={content.about.title}
                                onChange={event => handleSimpleChange('about.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-gray-300 mb-1">Texto</span>
                            <textarea
                                value={content.about.text}
                                onChange={event => handleSimpleChange('about.text', event.target.value)}
                                rows={5}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                    </div>
                </details>

                <details className="bg-gray-900 rounded-lg border border-gray-700" open>
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Áreas de atuação</summary>
                    <div className="px-4 pb-4 space-y-4">
                        <label className="text-sm block">
                            <span className="block text-gray-300 mb-1">Título da seção</span>
                            <input
                                type="text"
                                value={content.areas.title}
                                onChange={event => handleSimpleChange('areas.title', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <div className="space-y-3">
                            {content.areas.items.map((area, index) => (
                                <div key={`area-${index}`} className="border border-gray-700 rounded-lg p-4 bg-gray-900 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-200">Área {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeArea(index)}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {renderIconPreview(area.icon)}
                                        <button
                                            type="button"
                                            onClick={() => openIconPicker(index)}
                                            className="px-3 py-2 text-xs rounded border border-gray-700 hover:bg-gray-800"
                                        >
                                            Escolher ícone
                                        </button>
                                    </div>
                                    <label className="text-sm block">
                                        <span className="block text-gray-300 mb-1">Título</span>
                                        <input
                                            type="text"
                                            value={area.title}
                                            onChange={event => handleAreaChange(index, 'title', event.target.value)}
                                            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addArea}
                            className="px-3 py-2 text-sm rounded border border-gray-700 hover:bg-gray-800"
                        >
                            Adicionar área
                        </button>
                    </div>
                </details>

                <details className="bg-gray-900 rounded-lg border border-gray-700">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Rodapé</summary>
                    <div className="px-4 pb-4 space-y-4">
                        <label className="text-sm block">
                            <span className="block text-gray-300 mb-1">Texto</span>
                            <input
                                type="text"
                                value={content.footer.text}
                                onChange={event => handleSimpleChange('footer.text', event.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                            />
                        </label>
                        <div className="space-y-3">
                            {content.footer.social.map((item, index) => (
                                <div key={`social-${index}`} className="border border-gray-700 rounded-lg p-4 bg-gray-900 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-200">Rede social {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeSocial(index)}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                    <label className="text-sm block">
                                        <span className="block text-gray-300 mb-1">Nome</span>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={event => handleSocialChange(index, 'name', event.target.value)}
                                            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                        />
                                    </label>
                                    <label className="text-sm block">
                                        <span className="block text-gray-300 mb-1">Link</span>
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={event => handleSocialChange(index, 'link', event.target.value)}
                                            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                        />
                                    </label>
                                    <label className="text-sm block">
                                        <span className="block text-gray-300 mb-1">Ícone (SVG path)</span>
                                        <input
                                            type="text"
                                            value={item.icon}
                                            onChange={event => handleSocialChange(index, 'icon', event.target.value)}
                                            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B98F58]"
                                            placeholder="M12 3..."
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addSocial}
                            className="px-3 py-2 text-sm rounded border border-gray-700 hover:bg-gray-800"
                        >
                            Adicionar rede social
                        </button>
                    </div>
                </details>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 rounded bg-[#B98F58] hover:bg-[#a37d4b] font-semibold"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar conteúdo'}
                    </button>
                </div>
            </form>

            {isIconPickerOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">{modalTitle || 'Selecione um ícone'}</h3>
                            <button
                                type="button"
                                onClick={() => setIconPickerIndex(null)}
                                className="text-2xl text-gray-400 hover:text-white"
                                aria-label="Fechar"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                            {predefinedIcons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => handleSelectIcon(icon)}
                                    className="flex items-center justify-center rounded border border-gray-700 bg-gray-800 h-16 hover:border-[#B98F58]"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                        className="h-8 w-8 text-[#B98F58]"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ContentEditor;
