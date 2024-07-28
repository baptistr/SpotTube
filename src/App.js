import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated', 'bg-primary', 'bg-danger', 'bg-dark', 'bg-success');

        if (status === 'Running') {
            progressBar.classList.add('bg-success', 'progress-bar-animated');
        } else if (status === 'Stopped') {
            progressBar.classList.add('bg-danger');
        } else if (status === 'Idle') {
            progressBar.classList.add('bg-primary');
        } else if (status === 'Complete') {
            progressBar.classList.add('bg-dark');
        }

        progressBar.classList.add('progress-bar-striped');
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
        <div className="bg-secondary-subtle vh-100">
            <div className="container-fluid bg-dark">
                <div className="top-bar d-flex justify-content-between align-items-center">
                    <h1 className="title text-center text-light flex-grow-1">Music Downloader</h1>
                </div>
            </div>

            <div className="container mt-5">
                <div className="position-relative rounded-pill shadow-lg">
                    <div className="input-group">
                        <input
                            id="search-box"
                            type="text"
                            className="form-control rounded-pill z-0"
                            placeholder="Enter Spotify Link"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <div className="input-group-append position-absolute top-0 end-0">
                            <button className="btn btn-primary rounded-end-pill" type="button" id="download-button" onClick={handleDownloadClick}>
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-4">
                <h2 className="text-center me-2 mb-2">Import List</h2>
                <div id="table-box" className="shadow-lg rounded">
                    <table id="progress-table" className="table table-hover mb-0">
                        <thead className="bg-primary-subtle sticky-top top-0">
                            <tr>
                                <th>Artist</th>
                                <th>Title</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progressData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.Artist}</td>
                                    <td>{item.Title}</td>
                                    <td>{item.Status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer>
                <div className="container mb-3 fixed-bottom">
                    <div id="progress-status-bar" className="progress">
                        <div ref={progressBarRef} className="progress-bar-striped bg-primary" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MusicDownloader;