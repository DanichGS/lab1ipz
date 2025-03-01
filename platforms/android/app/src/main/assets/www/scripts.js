// Функція для зйомки фото
function takePhoto() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        correctOrientation: true,  // Виправляє орієнтацію фото
        saveToPhotoAlbum: true
    });

    function onSuccess(imageURI) {
        // Викликаємо функцію для перетворення файлу в Base64
        convertFileToBase64(imageURI, function(base64Image) {
            // Додаємо Base64 зображення до галереї
            addPhotoToGallery(base64Image);
            displayGallery();
        });
    }

    function onFail(message) {
        alert('Помилка: ' + message);
    }
}

function convertFileToBase64(fileURI, callback) {
    window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
        fileEntry.file(function(file) {
            let reader = new FileReader();
            reader.onloadend = function() {
                // Результат у форматі Base64
                let base64Data = reader.result;
                callback(base64Data);
            };
            reader.readAsDataURL(file);
        }, function(error) {
            console.error("Помилка доступу до файлу: ", error);
        });
    }, function(error) {
        console.error("Помилка розв'язування шляху до файлу: ", error);
    });
}


// Додаємо зображення Base64 до локального сховища
function addPhotoToGallery(base64Image) {
    let photos = JSON.parse(localStorage.getItem('photos')) || [];
    photos.push(base64Image);
    localStorage.setItem('photos', JSON.stringify(photos));
}

// Відображаємо галерею зображень
function displayGallery() {
    let photos = JSON.parse(localStorage.getItem('photos')) || [];
    let galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = '';

    photos.forEach(function(photoURI) {
        let img = document.createElement('img');
        img.src = photoURI;
        img.alt = "Фото з галереї";
        img.classList.add('gallery-photo');
        galleryContainer.appendChild(img);
    });
}
// Завантажуємо галерею при завантаженні сторінки
document.addEventListener('DOMContentLoaded', displayGallery);

function clearGallery() {
    // Очищаємо зображення в localStorage
    localStorage.removeItem('photos');

    // Оновлюємо галерею
    displayGallery();
}


// Функція для показу/приховування геолокації
function toggleLocation() {
    let locationElement = document.getElementById('location');
    
    // Якщо блок прихований, показуємо його і отримуємо геолокацію
    if (locationElement.style.display === 'none') {
        locationElement.style.display = 'block';
        getLocation();
    } else {
        // Якщо блок вже показаний, приховуємо його
        locationElement.style.display = 'none';
    }
}

// Функція для отримання геолокації
function getLocation() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    function onSuccess(position) {
        document.getElementById('location').innerHTML =
            'Широта: ' + position.coords.latitude + '<br>' +
            'Довгота: ' + position.coords.longitude;
    }

    function onError(error) {
        document.getElementById('location').innerHTML = "Помилка: " + error.message;
    }
}

// Функція для показу/приховування даних акселерометра
function toggleAccelerationData() {
    let accelerationData = document.getElementById('accelerationData');
    
    // Якщо блок прихований, показуємо його і починаємо збір даних
    if (accelerationData.style.display === 'none') {
        accelerationData.style.display = 'block';
        startAccelerationWatch();
    } else {
        // Якщо блок видимий, приховуємо його і зупиняємо збір даних
        accelerationData.style.display = 'none';
    }
}

// Функція для отримання даних з акселеромметра
function startAccelerationWatch() {
    navigator.accelerometer.watchAcceleration(onAccelSuccess, onAccelError, { frequency: 1000 });

    function onAccelSuccess(acceleration) {
        document.getElementById("accelerationX").textContent = acceleration.x.toFixed(2);
        document.getElementById("accelerationY").textContent = acceleration.y.toFixed(2);
        document.getElementById("accelerationZ").textContent = acceleration.z.toFixed(2);
    }

    function onAccelError() {
        document.getElementById("accelerationData").textContent = "Не вдалося отримати дані прискорення.";
    }
}

// Функція для завантаження завдань із localStorage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Очищаємо HTML-список і додаємо кожне завдання з localStorage
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        addTaskToDOM(task.id, task.text, task.completed);
    });
}

// Функція для додавання завдання в DOM і збереження в localStorage
function addTask() {
    let taskInput = document.getElementById('new-task');
    let taskText = taskInput.value.trim();

    if (taskText === '') return; // Не додаємо пусте завдання

    let taskId = Date.now().toString(); // Унікальний ID на основі часу
    addTaskToDOM(taskId, taskText, false); // Додаємо завдання в DOM

    // Додаємо завдання в localStorage
    saveTask(taskId, taskText, false);
    taskInput.value = ''; // Очищаємо поле вводу
}

// Додає завдання в DOM
function addTaskToDOM(taskId, taskText, completed) {
    let taskList = document.getElementById('task-list');

    let li = document.createElement('li');
    li.id = taskId;

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.onchange = () => toggleTask(taskId);
    
    let label = document.createElement('label');
    label.textContent = taskText;
    
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Видалити';
    deleteButton.onclick = () => deleteTask(taskId);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
}

// Зберігає завдання в localStorage
function saveTask(taskId, taskText, completed) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: taskId, text: taskText, completed: completed });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Оновлює стан завдання (виконано чи ні) в localStorage
function toggleTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.completed = !task.completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Видаляє завдання з DOM та localStorage
function deleteTask(taskId) {
    document.getElementById(taskId).remove();

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Завантаження завдань при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadTasks);

