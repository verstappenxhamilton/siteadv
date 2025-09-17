
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';

type Report = {
    sessionId: string;
    text?: string;
    timestamp: number;
    name?: string;
    contact?: string;
};

interface ReportsProps {
    socket?: Socket | null;
}

const renderMarkdown = (text: string) => {
    const lines = text.split(/\n+/);
    return lines.map((line, index) => {
        if (!line.trim()) {
            return <br key={`blank-${index}`} />;
        }
        if (line.startsWith('### ')) {
            return (
                <h4 key={`heading-${index}`} className="text-sm font-semibold text-[#B98F58]">
                    {line.replace('### ', '').trim()}
                </h4>
            );
        }
        return (
            <p key={`line-${index}`} className="text-sm text-gray-200">
                {line}
            </p>
        );
    });
};

const Reports: React.FC<ReportsProps> = ({ socket }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/admin/reports');
            const data = await response.json();
            const sorted = Array.isArray(data)
                ? data.sort((a: Report, b: Report) => b.timestamp - a.timestamp)
                : [];
            setReports(sorted);
        } catch (error) {
            console.error('Failed to load reports', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        if (!socket) return;
        const handleNewReport = (report: Report) => {
            setReports(prev => [report, ...prev]);
        };
        socket.on('new-report', handleNewReport);
        return () => {
            socket.off('new-report', handleNewReport);
        };
    }, [socket]);

    const hasReports = reports.length > 0;
    const orderedReports = useMemo(() => [...reports].sort((a, b) => b.timestamp - a.timestamp), [reports]);

    return (
        <section className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Relatórios</h2>
                <button
                    onClick={() => void fetchReports()}
                    className="px-3 py-1 text-sm rounded border border-gray-600 hover:bg-gray-700"
                    disabled={isLoading}
                >
                    {isLoading ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>
            {!hasReports && !isLoading && (
                <p className="text-sm text-gray-300">Os relatórios gerados pela IA aparecerão aqui assim que os atendimentos forem concluídos.</p>
            )}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {orderedReports.map(report => (
                    <article key={`${report.sessionId}-${report.timestamp}`} className="bg-gray-900 rounded-md p-4 space-y-3 border border-gray-700">
                        <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                            <span>{new Date(report.timestamp).toLocaleString()}</span>
                            {report.name && (
                                <span className="text-gray-300 font-medium">
                                    {report.name}
                                    {report.contact ? ` • ${report.contact}` : ''}
                                </span>
                            )}
                        </header>
                        {report.text ? <div className="space-y-2">{renderMarkdown(report.text)}</div> : <p className="text-sm text-gray-300">Relatório sem conteúdo disponível.</p>}
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Reports;
