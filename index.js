// front-end

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5000/getAll')
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']));
});

document.querySelector('table tbody').addEventListener('click', function (event) {
    if (event.target.className === "delete-row-btn") {
        deleteRowById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
        handleEditRow(event.target.dataset.id);
    }
});

const updateBtn = document.querySelector('#update-row-btn');
const searchBtn = document.querySelector('#search-btn');

const searchInput = document.querySelector('#search-input');

searchInput.addEventListener('input', function () {
    const searchValue = searchInput.value;

    if (searchValue === '') {
        fetch('http://localhost:5000/getAll')
            .then(response => response.json())
            .then(data => loadHTMLTable(data['data']));
    } else {
        fetch('http://localhost:5000/search/' + searchValue)
            .then(response => response.json())
            .then(data => loadHTMLTable(data['data']));
    }
});

// searchBtn.onclick = function () {                                                 // OLD FUNCTION USED FOR A SEARCH BUTTON I HAD
//     const searchValue = document.querySelector('#search-input').value;

//     if (searchValue === '') {
//         fetch('http://localhost:5000/getAll')
//             .then(response => response.json())
//             .then(data => loadHTMLTable(data['data']));
//     } else {
//         fetch('http://localhost:5000/search/' + searchValue)
//             .then(response => response.json())
//             .then(data => loadHTMLTable(data['data']));
//     }
// }

function deleteRowById(id) {
    fetch('http://localhost:5000/delete/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
}

function handleEditRow(id) { // shows update section
    const updateSection = document.querySelector('#update-row');
    updateSection.hidden = false;
    document.querySelector('#update-name-input').dataset.id = id;
}

updateBtn.onclick = function() {
    const updateNameInput = document.querySelector('#update-name-input');
    const updateSetsInput = document.querySelector('#update-sets-input');
    const updateRepsInput = document.querySelector('#update-reps-input');

    const name = updateNameInput.value;
    const sets = updateSetsInput.value;
    const reps = updateRepsInput.value;

    // Check if the input fields are empty IF SO THEN THIS PREVENTS FALLING INTO THE NEXT IF STATEMENT
    if (sets === '' || reps === '') {
        fetch('http://localhost:5000/update', {
            method: 'PATCH',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify({
                id: updateNameInput.dataset.id,
                name: name,
                sets: sets,
                reps: reps
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        })
    return;
    }

    // Check if the sets or reps are less than or equal to 0
    if (sets <= 0 || reps <= 0) {
        alert('Please enter a number greater than 0 for sets and reps.');
        return;
    }

    fetch('http://localhost:5000/update', {
        method: 'PATCH',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify({
            id: updateNameInput.dataset.id,
            name: name,
            sets: sets,
            reps: reps
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })
}

const addBtn = document.querySelector('#add-name-btn');

addBtn.onclick = function () {
    const nameInput = document.querySelector('#name-input');
    const name = nameInput.value;
    const setsInput = document.querySelector('#sets-input');
    const sets = setsInput.value >= 0 ? setsInput.value : 0; // check against negative input
    const repsInput = document.querySelector('#reps-input');
    const reps = repsInput.value >= 0 ? repsInput.value : 0; // check against negative input
    nameInput.value = "";
    setsInput.value = "";
    repsInput.value = "";


    fetch('http://localhost:5000/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ name : name, sets : sets, reps : reps})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

const submitButton = document.querySelector('#register-submit-button');

submitButton.addEventListener('click', function(event) {
  event.preventDefault();
  

  const nameInput = document.querySelector('#new_username');
  const name = nameInput.value;
  const emailInput = document.querySelector('#new_email');
  const email = emailInput.value;
  const passwordInput = document.querySelector('#new_password');
  const password = passwordInput.value;

  fetch('http://localhost:5000/insertUserInfo', {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ username: name, email: email, password: password })
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
});

// login
const loginForm = document.querySelector('.login-container form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent form submission

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (data.success) {
    loginForm.reset();
    const loginContainer = document.querySelector('.login-container');
    loginContainer.classList.add('hidden');
  } else {
    alert(data.message);
  }
});


function insertRowIntoTable(data) {
    console.log(data);
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = "<tr>";

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === 'dateAdded') {
                data[key] = new Date(data[key]).toLocaleString();
            }
            tableHtml += `<td>${data[key]}</td>`;
        }
    }

    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</td>`;
    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, name, date_added, sets, reps}) {
        const date = new Date(date_added);
        const formattedDate = `${date.toLocaleDateString()} <br> ${date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}`;

        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${formattedDate}</td>`;
        tableHtml += `<td>${sets}</td>`;
        tableHtml += `<td>${reps}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}


// Login and Registration container hiding

function showRegisterContainer() {
    document.querySelector('.login-container').style.display = 'none';
    document.querySelector('.register-container').style.display = 'block';
  }
  function showLoginContainer() {
    document.querySelector('.register-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'block';
  }
  function hideLoginAndRegister() {
    document.querySelector('.register-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'none';
  }




