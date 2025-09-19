import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/lawyer-page.css";

type AiProvider = "openai" | "anthropic" | "groq" | "gemini";

type AiParameters = {
  model?: string;
  max_output_tokens: number;
  temperature: number;
  top_p: number;
};

type AiConfig = {
  provider: AiProvider;
  parameters: AiParameters;
  prompt: string;
};

type ApiKeys = Record<AiProvider, string>;

type ReportItem = {
  id?: string;
  timestamp: number;
  name?: string;
  contact?: string;
  text?: string;
};

type ThemeOption = "classic" | "aurora";

const THEME_OPTIONS: { value: ThemeOption; label: string; description: string }[] = [
  { value: "classic", label: "Clássico", description: "Tema tradicional do painel" },
  {
    value: "aurora",
    label: "Aurora",
    description: "Tema clean com visual translúcido e moderno",
  },
];

const THEME_STORAGE_KEY = "lawyer-dashboard-theme";

const PROVIDER_MODELS: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  groq: "mixtral-8x7b-32768",
  gemini: "gemini-2.0-flash",
};

const DEFAULT_CONFIG: AiConfig = {
  provider: "openai",
  parameters: {
    model: PROVIDER_MODELS.openai,
    max_output_tokens: 200,
    temperature: 0.7,
    top_p: 1,
  },
  prompt:
    "Voce e um advogado virtual do escritorio. Responda em portugues formal e breve. Ao receber o resumo do cliente, gere perguntas objetivas para coletar dados e verificar documentos, incluindo opcoes como usucapiao judicial ou extrajudicial e seus custos no TJMG quando pertinente. Apos as respostas do cliente, de uma orientacao final e finalize com uma linha \"RELATORIO:\" resumindo as informacoes para o advogado.",
};

const DEFAULT_KEYS: ApiKeys = {
  openai: "",
  anthropic: "",
  groq: "",
  gemini: "",
};

const KEY_PROVIDERS: AiProvider[] = ["openai", "anthropic", "groq", "gemini"];

const formatReportText = (text?: string) => {
  if (!text) return "";
  return text.replace(/### (.*)/g, "<h3>$1</h3>").replace(/\n/g, "<br />");
};

const LawyerPage: React.FC = () => {
  const [config, setConfig] = useState<AiConfig>(DEFAULT_CONFIG);
  const [keys, setKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [configStatus, setConfigStatus] = useState("");
  const [keysStatus, setKeysStatus] = useState("");
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportError, setReportError] = useState("");
  const [theme, setTheme] = useState<ThemeOption>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === "classic" || storedTheme === "aurora") {
        return storedTheme;
      }
    }
    return "classic";
  });

  const formattedReports = useMemo(
    () => [...reports].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)),
    [reports]
  );

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/admin/config");
        if (!response.ok) throw new Error("Falha ao carregar configuracao");
        const data = await response.json();
        const provider = (KEY_PROVIDERS.includes(data.provider) ? data.provider : DEFAULT_CONFIG.provider) as AiProvider;
        setConfig({
          provider,
          parameters: {
            model: data.parameters?.model ?? PROVIDER_MODELS[provider],
            max_output_tokens: Number(
              data.parameters?.max_output_tokens ?? DEFAULT_CONFIG.parameters.max_output_tokens
            ),
            temperature: Number(data.parameters?.temperature ?? DEFAULT_CONFIG.parameters.temperature),
            top_p: Number(data.parameters?.top_p ?? DEFAULT_CONFIG.parameters.top_p),
          },
          prompt: data.prompt ?? DEFAULT_CONFIG.prompt,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const loadKeys = async () => {
      try {
        const response = await fetch("/admin/keys");
        if (!response.ok) throw new Error("Falha ao carregar chaves");
        const data = await response.json();
        setKeys({
          openai: data.openai ?? "",
          anthropic: data.anthropic ?? "",
          groq: data.groq ?? "",
          gemini: data.gemini ?? "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    const loadReports = async () => {
      setIsLoadingReports(true);
      setReportError("");
      try {
        const response = await fetch("/admin/reports");
        if (!response.ok) throw new Error("Falha ao carregar relatorios");
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setReportError("Nao foi possivel carregar os relatorios.");
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadConfig();
    loadKeys();
    loadReports();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const handleThemeSelect = (value: ThemeOption) => {
    setTheme((current) => (current === value ? current : value));
  };

  const isAuroraTheme = theme === "aurora";
  const headerLinkBaseClass = "theme-switcher-link d-flex align-items-center gap-2";
  const headerLinkClass = `${isAuroraTheme ? "btn btn-primary" : "btn btn-outline-light"} ${headerLinkBaseClass}`;
  const rootClassName = `lawyer-page theme-${theme}`;

  const handleConfigChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if (name === "provider") {
      const provider = (value as AiProvider) ?? DEFAULT_CONFIG.provider;
      setConfig((prev) => ({
        ...prev,
        provider,
        parameters: {
          ...prev.parameters,
          model: PROVIDER_MODELS[provider],
        },
      }));
      return;
    }

    if (name.startsWith("parameters.")) {
      const key = name.replace("parameters.", "") as keyof AiParameters;
      setConfig((prev) => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [key]: key === "max_output_tokens" || key === "temperature" || key === "top_p" ? Number(value) : value,
        },
      }));
      return;
    }

    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfigSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfigStatus("");
    try {
      const response = await fetch("/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Falha ao salvar configuracao");
      setConfigStatus("Configuracao salva com sucesso.");
    } catch (error) {
      console.error(error);
      setConfigStatus("Nao foi possivel salvar a configuracao.");
    }
  };

  const handleKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (!KEY_PROVIDERS.includes(name as AiProvider)) return;
    const provider = name as AiProvider;
    setKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const handleKeysSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeysStatus("");
    try {
      const response = await fetch("/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keys),
      });
      if (!response.ok) throw new Error("Falha ao salvar chaves");
      setKeysStatus("Chaves salvas com sucesso.");
    } catch (error) {
      console.error(error);
      setKeysStatus("Nao foi possivel salvar as chaves.");
    }
  };

  const refreshReports = async () => {
    setIsLoadingReports(true);
    setReportError("");
    try {
      const response = await fetch("/admin/reports");
      if (!response.ok) throw new Error("Falha ao carregar relatorios");
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReportError("Nao foi possivel carregar os relatorios.");
    } finally {
      setIsLoadingReports(false);
    }
  };

  return (
    <div className={rootClassName}>
      <header
        className={`lawyer-navbar navbar navbar-expand-lg shadow-sm ${
          isAuroraTheme ? "navbar-light" : "navbar-dark"
        }`}
      >
        <div className="container py-3">
          <div className="d-flex flex-wrap align-items-center gap-3 w-100">
            <div className="d-flex align-items-center gap-3 flex-grow-1 min-width-0">
              <span className="navbar-brand fw-bold fs-4 mb-0 text-truncate">Painel do Advogado</span>
              <span className="status-indicator rounded-pill">Você está online</span>
            </div>
            <div className="d-flex align-items-center gap-3 ms-auto flex-wrap justify-content-end theme-controls">
              <div className="theme-switcher" role="group" aria-label="Seleção de tema">
                <span className="theme-switcher-label d-flex align-items-center gap-2 text-uppercase">
                  <i className="bi bi-stars" aria-hidden="true" />
                  Tema
                </span>
                <div className="theme-switcher-options">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`theme-chip ${theme === option.value ? "active" : ""}`}
                      data-theme={option.value}
                      onClick={() => handleThemeSelect(option.value)}
                      aria-pressed={theme === option.value}
                      title={option.description}
                    >
                      <span className="theme-chip-swatch" aria-hidden="true" />
                      <span className="theme-chip-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Link to="/" className={headerLinkClass}>
                <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                Ver Página do Cliente
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mt-4 mb-5">
        <div className="row g-4">
          <div className="col-lg-7">
            <section className="card shadow-sm mb-4" id="videoPanel">
              <div className="card-header fw-bold">Atendimento por Video</div>
              <div className="card-body">
                <div className="alert alert-info small mb-4">
                  Integracao de video chamada depende da infraestrutura de sinalizacao e sera habilitada quando o backend estiver disponivel.
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="video-box rounded">
                      <div className="video-placeholder">Video do cliente</div>
                    </div>
                    <div className="text-muted small mt-1">Cliente</div>
                  </div>
                  <div className="col-12">
                    <div className="video-box rounded">
                      <div className="video-placeholder">Sua camera (mutada)</div>
                    </div>
                    <div className="text-muted small mt-1">Voce (mudo)</div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-danger" disabled>
                    <i className="bi bi-telephone-x-fill me-2" />Encerrar
                  </button>
                  <button className="btn btn-secondary" disabled>
                    <i className="bi bi-gear-fill me-2" />Testar dispositivos
                  </button>
                </div>
                <div id="info" className="mt-3 text-muted">Aguardando infraestrutura de chamada...</div>
              </div>
            </section>

            <section className="card shadow-sm" id="chatPanel">
              <div className="card-header fw-bold">Chat de Texto</div>
              <div className="card-body">
                <div className="alert alert-warning small mb-3">
                  O chat em tempo real sera habilitado quando o backend de websocket estiver configurado.
                </div>
                <div className="chat-messages placeholder" />
                <div className="input-group mt-3">
                  <input type="text" className="form-control" placeholder="Digite sua mensagem" disabled />
                  <button className="btn btn-primary" disabled>
                    <i className="bi bi-send-fill" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-5">
            <section className="card shadow-sm mb-4" id="aiPanel">
              <div className="card-header fw-bold">Assistente de IA</div>
              <div className="card-body">
                <div className="chat-messages placeholder" />
                <div className="input-group mt-3">
                  <input type="text" className="form-control" placeholder="Pergunte a IA" disabled />
                  <button className="btn btn-secondary" disabled>
                    <i className="bi bi-send-fill" />
                  </button>
                </div>
              </div>
            </section>

            <section className="card shadow-sm mb-4">
              <div className="card-header fw-bold">Configuracoes de IA</div>
              <div className="card-body">
                <form onSubmit={handleConfigSubmit} className="config-form">
                  <div className="mb-3">
                    <span className="form-label d-block">Provedor</span>
                    <div className="d-flex flex-wrap gap-3">
                      {KEY_PROVIDERS.map((provider) => {
                        const optionClass = `provider-option ${config.provider === provider ? "selected" : ""}`;
                        return (
                          <label key={provider} className={optionClass}>
                            <input
                              type="radio"
                              name="provider"
                              value={provider}
                              checked={config.provider === provider}
                              onChange={handleConfigChange}
                            />
                            <span className="ms-2 text-capitalize">{provider}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="model">Modelo</label>
                    <input
                      id="model"
                      name="parameters.model"
                      className="form-control"
                      value={config.parameters.model ?? ""}
                      onChange={handleConfigChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="maxTokens">Max Tokens</label>
                      <input
                        id="maxTokens"
                        name="parameters.max_output_tokens"
                        type="number"
                        className="form-control"
                        value={config.parameters.max_output_tokens}
                        onChange={handleConfigChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="temperature">Temp</label>
                      <input
                        id="temperature"
                        name="parameters.temperature"
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={config.parameters.temperature}
                        onChange={handleConfigChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="topP">Top P</label>
                      <input
                        id="topP"
                        name="parameters.top_p"
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={config.parameters.top_p}
                        onChange={handleConfigChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="prompt">Prompt</label>
                    <textarea
                      id="prompt"
                      name="prompt"
                      rows={5}
                      className="form-control"
                      value={config.prompt}
                      onChange={handleConfigChange}
                    />
                  </div>
                  {configStatus && <div className="alert alert-info py-2">{configStatus}</div>}
                  <button type="submit" className="btn btn-primary">Salvar configuracao</button>
                </form>
                <hr className="my-4" />
                <form onSubmit={handleKeysSubmit}>
                  <h5 className="mb-3">API Keys</h5>
                  {KEY_PROVIDERS.map((provider) => (
                    <div key={provider} className="mb-3">
                      <label className="form-label text-capitalize" htmlFor={`${provider}Key`}>
                        {provider}
                      </label>
                      <input
                        id={`${provider}Key`}
                        type="password"
                        name={provider}
                        className="form-control"
                        value={keys[provider]}
                        onChange={handleKeysChange}
                      />
                    </div>
                  ))}
                  {keysStatus && <div className="alert alert-info py-2">{keysStatus}</div>}
                  <button type="submit" className="btn btn-secondary">Salvar chaves</button>
                </form>
              </div>
            </section>

            <section className="card shadow-sm" id="reportsPanel">
              <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                Relatorios
                <button type="button" className="btn btn-sm btn-primary" onClick={refreshReports} disabled={isLoadingReports}>
                  <i className="bi bi-arrow-clockwise me-1" />
                  {isLoadingReports ? "Atualizando" : "Atualizar"}
                </button>
              </div>
              <div className="card-body">
                {reportError && <div className="alert alert-danger">{reportError}</div>}
                <div className="d-flex flex-column gap-3">
                  {formattedReports.length === 0 && !isLoadingReports && (
                    <div className="text-muted small">Nenhum relatorio disponivel.</div>
                  )}
                  {formattedReports.map((report) => (
                    <div key={report.id ?? report.timestamp} className="report-card card">
                      <div className="report-card-header">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted small">{new Date(report.timestamp).toLocaleString()}</span>
                          {report.name && <strong>{report.name}</strong>}
                        </div>
                        {report.contact && <div className="text-muted small">Contato: {report.contact}</div>}
                      </div>
                      <div className="report-card-body">
                        <div className="report-content" dangerouslySetInnerHTML={{ __html: formatReportText(report.text) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerPage;
