// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll with mobile optimization
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  // Disable smooth touch on mobile for better performance
  smoothTouch: window.innerWidth >= 768,
  touchMultiplier: 2,
  infinite: false,
});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Update smoothTouch on resize
window.addEventListener('resize', () => {
  lenis.options.smoothTouch = window.innerWidth >= 768;
});

// ============================================
// Navbar Link Active/Hover States
// ============================================
// Get navbar element first
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
let activeNavLink = document.querySelector('.nav-link[data-nav="home"]');

// Function to check if navbar has black background
function isNavbarBlack() {
  if (navbar) {
    return navbar.classList.contains('bg-black') && !navbar.classList.contains('bg-transparent');
  }
  return false;
}

// Function to update active nav link based on navbar state
function updateActiveLinkStyle() {
  if (!activeNavLink) return;
  
  const navbarIsBlack = isNavbarBlack();
  
  // Remove all background and text color classes
  activeNavLink.classList.remove('bg-black', 'bg-white', 'text-black', 'text-white');
  
  if (navbarIsBlack) {
    // Navbar is black: active link should have white bg and black text
    activeNavLink.classList.add('bg-white', 'text-black');
  } else {
    // Navbar is transparent: active link should have black bg and white text
    activeNavLink.classList.add('bg-black', 'text-white');
  }
}

// Function to update active nav link
function setActiveNavLink(link) {
  // Remove ALL background classes from all links
  navLinks.forEach((navLink) => {
    navLink.classList.remove('bg-black', 'bg-white', 'text-black', 'text-white');
    // Reset to default state (white text, no background)
    navLink.classList.add('text-white');
  });

  // Set the new active link
  activeNavLink = link;
  
  // Update active link style based on navbar state
  updateActiveLinkStyle();
}

// Add click event listeners with smooth scrolling
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNavLink(link);
    
    // Get the target section ID from data-nav attribute
    const targetId = link.getAttribute('data-nav');
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement && lenis) {
        // Use Lenis smooth scroll to the target section
        lenis.scrollTo(targetElement, {
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          offset: -100, // Offset 100px before section to show whole section
        });
      }
    }
  });

  // Add hover event listeners - always black bg on hover
  link.addEventListener('mouseenter', () => {
    if (link !== activeNavLink) {
      // Remove any existing background
      link.classList.remove('bg-white', 'text-black');
      link.classList.add('bg-black', 'text-white');
    }
  });

  link.addEventListener('mouseleave', () => {
    if (link !== activeNavLink) {
      // Remove hover background, return to default (no background, white text)
      link.classList.remove('bg-black', 'bg-white', 'text-black');
      link.classList.add('text-white');
    }
  });
});

// Initialize Home link as active
if (activeNavLink) {
  setActiveNavLink(activeNavLink);
}

// ============================================
// Image Container Overflow Hidden
// ============================================
// Add overflow hidden to all image parent containers (except section 1)
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section:not(:first-of-type)');
  sections.forEach((section) => {
    const images = section.querySelectorAll('img');
    images.forEach((img) => {
      const parent = img.parentElement;
      if (parent && !parent.classList.contains('s1')) {
        // Check if parent doesn't already have overflow hidden
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.overflow === 'visible') {
          parent.style.overflow = 'hidden';
        }
      }
    });
  });
});

// Navbar scroll effect for desktop
const mobileNavbar = document.getElementById('mobile-navbar');
const mobileMenu = document.getElementById('mobile-menu');
const menuToggle = document.getElementById('menu-toggle');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');

let isMenuOpen = false;

// Desktop navbar scroll effect with Lenis
if (navbar) {
  lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    if (scroll > 50) {
      navbar.classList.add('bg-black');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-black');
      navbar.classList.add('bg-transparent');
    }
    // Update active link style when navbar background changes
    updateActiveLinkStyle();
  });

  // Set initial state on page load
  window.addEventListener('load', () => {
    if (lenis.scroll === 0) {
      navbar.classList.add('bg-transparent');
    }
    // Update active link style on load
    updateActiveLinkStyle();
  });
}

// Mobile navbar scroll effect with Lenis
if (mobileNavbar) {
  lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    if (scroll > 50) {
      mobileNavbar.classList.add('bg-black');
      mobileNavbar.classList.remove('bg-transparent');
    } else {
      mobileNavbar.classList.remove('bg-black');
      mobileNavbar.classList.add('bg-transparent');
    }
  });

  // Set initial state on page load
  window.addEventListener('load', () => {
    if (lenis.scroll === 0) {
      mobileNavbar.classList.add('bg-transparent');
    }
  });
}

// Mobile menu toggle with GSAP animations
if (menuToggle && mobileMenu) {
  // Initialize GSAP timeline
  const menuTimeline = gsap.timeline({ paused: true });

  // Set initial state
  gsap.set(mobileMenu, { y: '-100%' });
  gsap.set(mobileMenu.querySelectorAll('li'), { opacity: 0, y: 20 });

  // Animation timeline
  menuTimeline
    .to(mobileMenu, {
      y: '0%',
      duration: 0.6,
      ease: 'power3.inOut'
    })
    .to(
      mobileMenu.querySelectorAll('li'),
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      },
      '-=0.3'
    );

  // Toggle menu function
  function toggleMenu() {
    if (!isMenuOpen) {
      // Open menu
      isMenuOpen = true;
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      menuTimeline.play();
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      // Close menu
      isMenuOpen = false;
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      menuTimeline.reverse();
      document.body.style.overflow = ''; // Restore body scroll
    }
  }

  // Event listeners
  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when clicking on a link and scroll to section
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get target section from href
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1); // Remove the #
        const targetElement = document.getElementById(targetId);
        
        if (targetElement && lenis) {
          // Close menu first
          if (isMenuOpen) {
            toggleMenu();
          }
          
          // Small delay to allow menu to close, then scroll
          setTimeout(() => {
            lenis.scrollTo(targetElement, {
              duration: 1.5,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              offset: -100, // Offset 100px before section to show whole section
            });
          }, 300);
        }
      } else if (isMenuOpen) {
        toggleMenu();
      }
    });
  });

  // Close menu when clicking outside (on overlay)
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      if (isMenuOpen) {
        toggleMenu();
      }
    }
  });

  // Close menu on window resize (if switching to desktop - xl breakpoint is 1280px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280 && isMenuOpen) {
      toggleMenu();
    }
  });
}

// ============================================
// GSAP ScrollTrigger Animations
// ============================================

// Helper function to check if mobile device
const isMobile = () => window.innerWidth < 768;

// Helper function to get optimized animation settings
const getAnimationSettings = () => ({
  duration: isMobile() ? 0.6 : 1,
  stagger: isMobile() ? 0.05 : 0.1,
  ease: 'power3.out',
});

// Wait for DOM to be fully loaded
window.addEventListener('load', () => {
  // Set initial states for animations
  gsap.set('.animate-fade-up', { opacity: 0, y: 60 });
  gsap.set('.animate-fade-in', { opacity: 0 });
  gsap.set('.animate-scale', { opacity: 0, scale: 0.8 });
  gsap.set('.animate-slide-left', { opacity: 0, x: -60 });
  gsap.set('.animate-slide-right', { opacity: 0, x: 60 });

  // Section 2 - Content Reveal Animations
  const section2 = document.querySelector('section:nth-of-type(2)');
  if (section2) {
    // Left side text animation - find by container structure
    const leftContainer = section2.querySelector('div.flex.flex-col.gap-12 > div > div:first-child');
    if (leftContainer) {
      const leftText = leftContainer.querySelectorAll('p, strong');
      if (leftText.length > 0) {
        gsap.fromTo(
          leftText,
          {
            opacity: 0,
            x: -50,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section2,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }

    // Form animation
    const formInputs = section2.querySelectorAll('input, button');
    if (formInputs.length > 0) {
      const form = section2.querySelector('form');
      if (form) {
        gsap.fromTo(
          formInputs,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: form,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }

    // Info cards animation - find by background color class
    const cards = section2.querySelectorAll('div[class*="bg-[#F2F2F2]"]');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          scale: 0.9,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Amenities grid animation
    const amenitiesGrid = section2.querySelectorAll('div.grid.grid-cols-2 div');
    if (amenitiesGrid.length > 0) {
      gsap.fromTo(
        amenitiesGrid,
        {
          opacity: 0,
          y: 40,
          rotationX: 15,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: amenitiesGrid[0],
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // Section 3 - Gallery Animations
  const section3 = document.querySelector('section:nth-of-type(3)');
  if (section3) {
    const galleryImages = section3.querySelectorAll('div.grid img, div.grid > div');
    if (galleryImages.length > 0) {
      gsap.fromTo(
        galleryImages,
        {
          opacity: 0,
          scale: 0.85,
          y: 50,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          stagger: {
            amount: 0.6,
            from: 'random',
          },
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section3,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // Section 4 - Features Animations
  const section4 = document.querySelector('section:nth-of-type(4)');
  if (section4) {
    // Left side content - find by structure
    const leftContainer = section4.querySelector('div.flex.flex-col.gap-6 > div:first-child');
    if (leftContainer) {
      const leftContent = leftContainer.querySelectorAll('div:first-child p, div:first-child h2');
      if (leftContent.length > 0) {
        gsap.fromTo(
          leftContent,
          {
            opacity: 0,
            x: -40,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section4,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }


    // Right side cards
    const featureCards = section4.querySelectorAll('div.flex.flex-col.justify-center.items-center.gap-4');
    if (featureCards.length > 0) {
      gsap.fromTo(
        featureCards,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featureCards[0],
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // Section 5 - Location Animations
  const section5 = document.querySelector('section:nth-of-type(5)');
  if (section5) {
    // Map image animation
    const mapImage = section5.querySelector('img[src*="map"]');
    if (mapImage) {
      gsap.fromTo(
        mapImage,
        {
          opacity: 0,
          scale: 1.1,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: mapImage,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Advantages list animation
    const advantagesList = section5.querySelectorAll('ul.flex.flex-col li');
    if (advantagesList.length > 0) {
      gsap.fromTo(
        advantagesList,
        {
          opacity: 0,
          x: -60,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: advantagesList[0],
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Form animation
    const section5Form = section5.querySelector('form');
    if (section5Form) {
      const formElements = section5Form.querySelectorAll('input, button');
      if (formElements.length > 0) {
        gsap.fromTo(
          formElements,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section5Form,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }

    // Contact info card - find by border color class
    const contactCard = section5.querySelector('div[class*="border-2"][class*="border-[#DFDBDB]"]');
    if (contactCard) {
      gsap.fromTo(
        contactCard,
        {
          opacity: 0,
          x: 60,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactCard,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // Footer Animation
  const footer = document.querySelector('footer');
  if (footer) {
    const footerElements = footer.querySelectorAll('img, p, div');
    if (footerElements.length > 0) {
      gsap.fromTo(
        footerElements,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // Parallax effect for background images (excluding Section 1)
  const parallaxImages = document.querySelectorAll('img[src*="s2-bg1"]');
  parallaxImages.forEach((img) => {
    const parent = img.closest('section, div');
    if (parent) {
      gsap.to(img, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: parent,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  });

  // Smooth reveal for all headings
  const headings = document.querySelectorAll('h2, h1');
  headings.forEach((heading) => {
    if (!heading.closest('.s1')) {
      gsap.fromTo(
        heading,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  });

  // Refresh ScrollTrigger on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
});

// ============================================
// Popup Modal Functionality
// ============================================
const popupModal = document.getElementById('popup-modal');
const popupClose = document.getElementById('popup-close');
const popupForm = document.getElementById('popup-form');
const popupTriggers = document.querySelectorAll('.popup-trigger');

let popupAutoOpenTimer = null;
let popupReopenTimer = null;
let isFormSubmitted = false;

// Function to open popup
function openPopup() {
  if (popupModal && !isFormSubmitted) {
    popupModal.classList.remove('hidden');
    // Use requestAnimationFrame to ensure display change happens before animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        popupModal.classList.add('show');
      }, 10);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    });
  }
}

// Function to close popup
function closePopup() {
  if (popupModal) {
    popupModal.classList.remove('show');
    // Wait for animation to complete before hiding
    setTimeout(() => {
      popupModal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
    
    // Clear any existing reopen timer
    if (popupReopenTimer) {
      clearTimeout(popupReopenTimer);
    }
    
    // If form not submitted, set timer to reopen after 10 seconds
    if (!isFormSubmitted) {
      popupReopenTimer = setTimeout(() => {
        openPopup();
      }, 10000); // 10 seconds
    }
  }
}

// Open popup on button clicks
popupTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup();
  });
});

// Close popup on close button click
if (popupClose) {
  popupClose.addEventListener('click', () => {
    closePopup();
  });
}

// Close popup when clicking outside (on backdrop)
if (popupModal) {
  popupModal.addEventListener('click', (e) => {
    if (e.target === popupModal) {
      closePopup();
    }
  });
}

// Close popup on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popupModal && popupModal.classList.contains('show')) {
    closePopup();
  }
});

// Handle form submission
if (popupForm) {
  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(popupForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };
    
    // Here you can add your form submission logic (API call, etc.)
    console.log('Form submitted:', data);
    
    // Mark form as submitted
    isFormSubmitted = true;
    
    // Clear all timers
    if (popupAutoOpenTimer) {
      clearTimeout(popupAutoOpenTimer);
    }
    if (popupReopenTimer) {
      clearTimeout(popupReopenTimer);
    }
    
    // Show success message (optional)
    alert('Thank you! We will contact you soon.');
    
    // Close popup
    closePopup();
    
    // Reset form
    popupForm.reset();
  });
}

// Auto-open popup after 15 seconds on page load
window.addEventListener('load', () => {
  if (!isFormSubmitted) {
    popupAutoOpenTimer = setTimeout(() => {
      openPopup();
    }, 15000); // 15 seconds
  }
});

