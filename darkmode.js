const darkModeToggle = document.getElementById('dark-mode-toggle');
localStorage.setItem('darkMode', 'disabled');
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  darkModeToggle.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.style.color = "black";
    darkModeToggle.innerHTML = "☀️<br>Toggle Light Mode";
  } else {
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggle.style.color = "white";
    darkModeToggle.innerHTML = "🌙<br>Toggle Dark Mode";
  }
});

enterButton.addEventListener('click', () => {
  if (document.body.classList.contains('dark-mode')) {
    document.body.style.backgroundColor = "black";
  } else {
    document.body.style.backgroundColor = "white";
  }
});