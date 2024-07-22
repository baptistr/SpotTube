const download_button = document.getElementById('download-button');
const search_box = document.getElementById('search-box');
const progress_bar = document.getElementById('progress-status-bar');
const progress_table = document.getElementById('progress-table').getElementsByTagName('tbody')[0];

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('user');

const socket = io({
    query: {
        user
    }
});

function updateProgressBar(percentage, status) {
    progress_bar.style.width = percentage + "%";
    progress_bar.ariaValueNow = percentage + "%";
    progress_bar.classList.remove("progress-bar-striped");
    progress_bar.classList.remove("progress-bar-animated");

    if (status === "Running") {
        progress_bar.classList.remove("bg-primary", "bg-danger", "bg-dark");
        progress_bar.classList.add("bg-success");
        progress_bar.classList.add("progress-bar-animated");

    } else if (status === "Stopped") {
        progress_bar.classList.remove("bg-primary", "bg-success", "bg-dark");
        progress_bar.classList.add("bg-danger");

    } else if (status === "Idle") {
        progress_bar.classList.remove("bg-success", "bg-danger", "bg-dark");
        progress_bar.classList.add("bg-primary");

    } else if (status === "Complete") {
        progress_bar.classList.remove("bg-primary", "bg-success", "bg-danger");
        progress_bar.classList.add("bg-dark");
    }
    progress_bar.classList.add("progress-bar-striped");
}

download_button.addEventListener('click', () => {
    socket.emit("download", {
        "Link": search_box.value
    });
});

search_box.addEventListener('keydown', function (event) {
    if (event.key === "Enter") {
        socket.emit("download", { "Link": search_box.value });
    }
});

socket.on("download", (response) => {
    if (response.Status == "Success") {
        search_box.value = "";
    }
    else {
        search_box.value = response.Data;
        setTimeout(function () {
            search_box.value = "";
        }, 2000);
    }
});

socket.on("progress_status", (response) => {
    progress_table.innerHTML = '';
    response.Data.forEach(function (item) {
        const row = progress_table.insertRow();
        const cellArtist = row.insertCell(0);
        const cellTitle = row.insertCell(1);
        const cellStatus = row.insertCell(2);

        cellArtist.innerHTML = item.Artist;
        cellTitle.innerHTML = item.Title;
        cellStatus.innerHTML = item.Status;
    });
    const percent_completion = response.Percent_Completion;
    const actual_status = response.Status;
    updateProgressBar(percent_completion, actual_status);
});