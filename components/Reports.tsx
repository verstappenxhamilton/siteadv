
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Reports: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const socket = useRef<any>(null);

    useEffect(() => {
        socket.current = io();
        fetch('/admin/reports')
            .then(res => res.json())
            .then(data => setReports(data));

        socket.current.on('new-report', (report: any) => {
            setReports(prev => [report, ...prev]);
        });

        return () => {
            socket.current.disconnect();
        }
    }, []);

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold mb-4">Relatórios</h2>
            <div className="space-y-4">
                {reports.map((report, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-md">
                        <p className="text-sm text-gray-400">{new Date(report.timestamp).toLocaleString()}</p>
                        <p className="mt-2">{report.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
