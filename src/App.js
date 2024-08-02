import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const MusicDownloader = () => {
    const [searchValue, setSearchValue] = useState('');
    const [progressData, setProgressData] = useState([]);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [progressStatus, setProgressStatus] = useState('Idle');
    const progressBarRef = useRef(null);

    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:5002', {
            query: { user }
        });

        socketRef.current.on('download', (response) => {
            if (response.Status === 'Success') {
                setSearchValue('');
            } else {
                setSearchValue(response.Data);
                setTimeout(() => {
                    setSearchValue('');
                }, 2000);
            }
        });

        socketRef.current.on('progress_status', (response) => {
            setProgressData(response.Data);
            setProgressPercentage(response.Percent_Completion);
            setProgressStatus(response.Status);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [user]);

    useEffect(() => {
        updateProgressBar(progressPercentage, progressStatus);
    }, [progressPercentage, progressStatus]);

    const updateProgressBar = (percentage, status) => {
        const progressBar = progressBarRef.current;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.className = '';

        if (status === 'Running') {
            progressBar.classList.add('bg-violet-600', 'animate-pulse');
        } else if (status === 'Stopped') {
            progressBar.classList.add('bg-red-600');
        } else if (status === 'Idle') {
            progressBar.classList.add('bg-blue-600');
        } else if (status === 'Complete') {
            progressBar.classList.add('bg-gray-800');
        }

        progressBar.classList.add('h-full');
    };

    const handleDownloadClick = () => {
        socketRef.current.emit('download', { Link: searchValue });
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            socketRef.current.emit('download', { Link: searchValue });
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-violet-800 py-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-white text-3xl">Music Downloader</h1>
                </div>
            </div>

            <div className="container mx-auto mt-10">
                <div className="relative shadow-lg rounded-lg overflow-hidden">
                    <input
                        id="search-box"
                        type="text"
                        className="w-full p-4 rounded-t-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="Enter Spotify Link"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button
                        className="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        type="button"
                        id="download-button"
                        onClick={handleDownloadClick}
                    >
                        Download
                    </button>
                </div>
            </div>

            <div className="container mx-auto mt-6">
                <h2 className="text-center text-2xl mb-4">Import List</h2>
                <div className="shadow-lg rounded-lg overflow-hidden">
                    <table id="progress-table" className="w-full table-auto">
                        <thead className="bg-violet-200">
                            <tr>
                                <th className="px-4 py-2">Artist</th>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progressData.map((item, index) => (
                                <tr key={index} className="bg-white border-b">
                                    <td className="px-4 py-2">{item.Artist}</td>
                                    <td className="px-4 py-2">{item.Title}</td>
                                    <td className="px-4 py-2">{item.Status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="fixed bottom-0 w-full">
                <div className="container mx-auto mb-4">
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div ref={progressBarRef} className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MusicDownloader;
