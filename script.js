// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    // User has scrolled down - add black background
    navbar.classList.add('bg-black');
    navbar.classList.remove('bg-transparent');
  } else {
    // User is at the top - make transparent
    navbar.classList.remove('bg-black');
    navbar.classList.add('bg-transparent');
  }
});

// Set initial state on page load
window.addEventListener('load', () => {
  if (window.scrollY === 0) {
    navbar.classList.add('bg-transparent');
  }
});

