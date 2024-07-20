const download_button = document.getElementById('download-button');
const clear_button = document.getElementById('clear-button');
const search_box = document.getElementById('search-box');
const config_modal = document.getElementById('config-modal');
const save_message = document.getElementById("save-message");
const save_changes_button = document.getElementById("save-changes-button");
const spotify_client_id = document.getElementById("spotify_client_id");
const spotify_client_secret = document.getElementById("spotify_client_secret");
const sleep_interval = document.getElementById("sleep_interval");
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

clear_button.addEventListener('click', function () {
    socket.emit("clear");
});

config_modal.addEventListener('show.bs.modal', function (event) {
    socket.emit("loadSettings");

    function handleSettingsLoaded(settings) {
        spotify_client_id.value = settings.spotify_client_id;
        spotify_client_secret.value = settings.spotify_client_secret;
        sleep_interval.value = settings.sleep_interval;
        socket.off("settingsLoaded", handleSettingsLoaded);
    }
    socket.on("settingsLoaded", handleSettingsLoaded);
});

save_changes_button.addEventListener("click", () => {
    socket.emit("updateSettings", {
        "spotify_client_id": spotify_client_id.value,
        "spotify_client_secret": spotify_client_secret.value,
        "sleep_interval": sleep_interval.value,
    });
    save_message.style.display = "block";
    setTimeout(function () {
        save_message.style.display = "none";
    }, 1000);
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

const themeSwitch = document.getElementById('themeSwitch');
const savedTheme = localStorage.getItem('theme');
const savedSwitchPosition = localStorage.getItem('switchPosition');

if (savedSwitchPosition) {
    themeSwitch.checked = savedSwitchPosition === 'true';
}

if (savedTheme) {
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
}

themeSwitch.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
    localStorage.setItem('theme', document.documentElement.getAttribute('data-bs-theme'));
    localStorage.setItem('switchPosition', themeSwitch.checked);
});