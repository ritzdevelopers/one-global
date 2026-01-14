// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Detect iOS devices
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Prevent unwanted scroll resets on iOS
if (isIOS) {
  // Disable Lenis completely on iOS to prevent conflicts
  // Use native browser scrolling instead
  let isScrolling = false;

  // Prevent multiple scroll events from interfering
  const handleIOSScroll = () => {
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(() => {
        ScrollTrigger.update();
        isScrolling = false;
      });
    }
  };

  window.addEventListener('scroll', handleIOSScroll, { passive: true });
}

// Initialize Lenis Smooth Scroll with iOS-specific handling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: !isIOS, // Disable smooth wheel on iOS
  wheelMultiplier: 1,
  // Disable smooth touch on iOS and mobile for better performance
  smoothTouch: !isIOS && window.innerWidth >= 768,
  touchMultiplier: 2,
  infinite: false,
});

// Integrate Lenis with GSAP ScrollTrigger (only if not iOS)
if (!isIOS) {
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
} else {
  // On iOS, use native scroll with ScrollTrigger
  ScrollTrigger.addEventListener('scroll', () => {
    ScrollTrigger.update();
  });
}

// Update smoothTouch on resize (only if not iOS)
if (!isIOS) {
  window.addEventListener('resize', () => {
    lenis.options.smoothTouch = window.innerWidth >= 768;
  });
}

// ============================================
// Navbar Link Active/Hover States
// ============================================
// Get navbar element first
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
let activeNavLink = document.querySelector('.nav-link[data-nav="home"]');

// Scroll Spy Variables
let isProgrammaticScroll = false; // Flag to prevent scroll spy during programmatic scrolling (clicking nav links)
let manualScrollTimeout = null;

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
    
    // Set flag to prevent scroll spy during programmatic scroll
    isProgrammaticScroll = true;
    if (manualScrollTimeout) {
      clearTimeout(manualScrollTimeout);
    }
    
    setActiveNavLink(link);

    // Get the target section ID from data-nav attribute
    const targetId = link.getAttribute('data-nav');
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        if (isIOS) {
          // On iOS, use native smooth scroll
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 100;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else if (lenis) {
          // Use Lenis smooth scroll for non-iOS devices
          lenis.scrollTo(targetElement, {
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            offset: -100, // Offset 100px before section to show whole section
          });
        }
      }
    }
    
    // Reset flag after scroll animation completes (2 seconds should be enough)
    manualScrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 2000);
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
// Scroll Spy - Auto-activate nav links on scroll
// ============================================

// Function to find which section is currently in view
function getCurrentSectionOnScroll() {
  const sections = ['home', 'overview', 'amenities', 'unit-type', 'gallery', 'features', 'location', 'contact'];
  const scrollY = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
  const viewportOffset = 150; // Offset from top of viewport to trigger activation (accounts for navbar)

  // If at the top, return home
  if (scrollY < 50) {
    return 'home';
  }

  // Check each section from bottom to top for immediate activation
  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionId = sections[i];
    const section = document.getElementById(sectionId);
    
    if (section) {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      
      // If section top is at or above the viewport offset, activate it immediately
      if (sectionTop <= viewportOffset) {
        return sectionId;
      }
    }
  }
  
  // Default to home
  return 'home';
}

// Function to update active nav link based on scroll position
function updateActiveNavOnScroll() {
  // Don't update during programmatic scrolling (when clicking nav links)
  if (isProgrammaticScroll) return;
  
  const currentSectionId = getCurrentSectionOnScroll();
  const correspondingLink = document.querySelector(`.nav-link[data-nav="${currentSectionId}"]`);
  
  if (correspondingLink && correspondingLink !== activeNavLink) {
    setActiveNavLink(correspondingLink);
  }
}

// Setup scroll spy listeners with immediate response
function initScrollSpy() {
  let rafId = null;
  
  const updateScrollSpy = () => {
    updateActiveNavOnScroll();
    rafId = null;
  };
  
  if (isIOS) {
    // On iOS, use native scroll event with requestAnimationFrame for immediate response
    window.addEventListener('scroll', () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScrollSpy);
      }
    }, { passive: true });
  } else if (lenis) {
    // On non-iOS, use Lenis scroll event with requestAnimationFrame for immediate response
    lenis.on('scroll', () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScrollSpy);
      }
    });
  }
  
  // Also check on initial load
  setTimeout(() => {
    updateActiveNavOnScroll();
  }, 100);
}

// Initialize scroll spy after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollSpy);
} else {
  initScrollSpy();
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

// Desktop navbar scroll effect
if (navbar) {
  const handleNavbarScroll = () => {
    const scrollY = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
    if (scrollY > 50) {
      navbar.classList.add('bg-black');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-black');
      navbar.classList.add('bg-transparent');
    }
    // Update active link style when navbar background changes
    updateActiveLinkStyle();
  };

  if (isIOS) {
    // On iOS, use native scroll event
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  } else if (lenis) {
    // On non-iOS, use Lenis scroll event
    lenis.on('scroll', handleNavbarScroll);
  }

  // Set initial state on page load
  window.addEventListener('load', () => {
    const scrollY = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
    if (scrollY === 0) {
      navbar.classList.add('bg-transparent');
    }
    // Update active link style on load
    updateActiveLinkStyle();
  });
}

// Mobile navbar scroll effect
if (mobileNavbar) {
  const handleMobileNavbarScroll = () => {
    const scrollY = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
    if (scrollY > 50) {
      mobileNavbar.classList.add('bg-black');
      mobileNavbar.classList.remove('bg-transparent');
    } else {
      mobileNavbar.classList.remove('bg-black');
      mobileNavbar.classList.add('bg-transparent');
    }
  };

  if (isIOS) {
    // On iOS, use native scroll event
    window.addEventListener('scroll', handleMobileNavbarScroll, { passive: true });
  } else if (lenis) {
    // On non-iOS, use Lenis scroll event
    lenis.on('scroll', handleMobileNavbarScroll);
  }

  // Set initial state on page load
  window.addEventListener('load', () => {
    const scrollY = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
    if (scrollY === 0) {
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
        duration: 0.1,
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

        if (targetElement) {
          // Close menu first
          if (isMenuOpen) {
            toggleMenu();
          }

          // Small delay to allow menu to close, then scroll
          setTimeout(() => {
            if (isIOS) {
              // On iOS, use native smooth scroll
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - 100;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            } else if (lenis) {
              // Use Lenis smooth scroll for non-iOS devices
              lenis.scrollTo(targetElement, {
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                offset: -100, // Offset 100px before section to show whole section
              });
            }
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

  // On iOS, use native scroll for ScrollTrigger
  if (isIOS) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ScrollTrigger.update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
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
let savedScrollPosition = 0; // Store scroll position when popup opens

// Check session storage for form submission status
function isFormSubmitted() {
  return sessionStorage.getItem('popupFormSubmitted') === 'true';
}

// Set form as submitted in session storage
function setFormSubmitted() {
  sessionStorage.setItem('popupFormSubmitted', 'true');
  // Clear any existing timers
  if (popupAutoOpenTimer) {
    clearTimeout(popupAutoOpenTimer);
    popupAutoOpenTimer = null;
  }
  if (popupReopenTimer) {
    clearTimeout(popupReopenTimer);
    popupReopenTimer = null;
  }
}

// Function to open popup
function openPopup() {
  // Check session storage before opening
  if (popupModal && !isFormSubmitted()) {
    // Save current scroll position
    savedScrollPosition = isIOS ? window.pageYOffset : (lenis ? lenis.scroll : window.pageYOffset);
    
    popupModal.classList.remove('hidden');
    // Use requestAnimationFrame to ensure display change happens before animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        popupModal.classList.add('show');
      }, 10);
      // Prevent body and html scroll when popup is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollPosition}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      // Prevent touch scrolling on mobile
      document.body.style.touchAction = 'none';
      // Stop Lenis smooth scroll if available
      if (lenis && !isIOS) {
        lenis.stop();
      }
    });
  }
}

// Function to close popup
function closePopup() {
  if (popupModal) {
    popupModal.classList.remove('show');
    
    setTimeout(() => {
      // Hide popup
      popupModal.classList.add('hidden');
      
      // Get scroll position
      const scrollPos = savedScrollPosition || 0;
      
      // Remove top first (this contains the negative scroll value)
      document.body.style.top = '';
      
      // Remove fixed and other styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      
      // Restore scroll - do it immediately after removing fixed
      window.scrollTo(0, scrollPos);
      
      // For Lenis
      if (lenis && !isIOS) {
        lenis.scroll = scrollPos;
        lenis.start();
      }
      
      // Double check after a moment
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        if (lenis && !isIOS) {
          lenis.scroll = scrollPos;
        }
      }, 100);
    }, 300);

    // Clear reopen timer
    if (popupReopenTimer) {
      clearTimeout(popupReopenTimer);
      popupReopenTimer = null;
    }
  }
}

// Function to start auto-open timer (opens popup only once after 7 seconds)
function startAutoOpenTimer() {
  // Clear any existing timer to prevent multiple timers
  if (popupAutoOpenTimer) {
    clearTimeout(popupAutoOpenTimer);
    popupAutoOpenTimer = null;
  }

  // Only start timer if form hasn't been submitted and popup hasn't been shown automatically
  if (!isFormSubmitted() && popupModal && !sessionStorage.getItem('popupAutoShown')) {
    popupAutoOpenTimer = setTimeout(() => {
      // Check again before opening (form might have been submitted while timer was running)
      if (!isFormSubmitted() && popupModal && popupModal.classList.contains('hidden')) {
        // Mark popup as auto-shown in session storage
        sessionStorage.setItem('popupAutoShown', 'true');
        openPopup();
      }
    }, 7000); // 7 seconds = 7000 milliseconds
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

// Old popup form handler removed - now using unified form handler in initializeFormHandlers()
// All forms (including popup) now use the same sendDataToGoogleSheet function

// Auto-open popup logic
// Start timer when page loads - popup will show only once after 7 seconds
window.addEventListener('load', () => {
  // Only start timer if form hasn't been submitted and popup hasn't been auto-shown
  if (!isFormSubmitted() && !sessionStorage.getItem('popupAutoShown')) {
    // Start auto-open timer (7 seconds) - opens only once
    startAutoOpenTimer();
  }
});

// ============================================
// Banner Slider - Infinite Loop with Manual Navigation
// ============================================
(function () {
  // Desktop Slider
  const desktopSlider = document.querySelector('.desktop-slider-container');
  const desktopSlides = document.querySelectorAll('.desktop-slide');
  const desktopPrevBtn = document.getElementById('desktop-slider-prev');
  const desktopNextBtn = document.getElementById('desktop-slider-next');
  const desktopPagination = document.getElementById('desktop-slider-pagination');
  let desktopCurrentIndex = 0;
  let desktopInterval = null;

  // Mobile Slider
  const mobileSlider = document.querySelector('.mobile-slider-container');
  const mobileSlides = document.querySelectorAll('.mobile-slide');
  const mobilePrevBtn = document.getElementById('mobile-slider-prev');
  const mobileNextBtn = document.getElementById('mobile-slider-next');
  const mobilePagination = document.getElementById('mobile-slider-pagination');
  let mobileCurrentIndex = 0;
  let mobileInterval = null;

  // Function to update desktop pagination dots
  function updateDesktopPagination() {
    if (!desktopPagination || desktopSlides.length === 0) return;

    desktopPagination.innerHTML = '';
    desktopSlides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `slider-pagination-dot ${index === desktopCurrentIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToDesktopSlide(index);
      });
      desktopPagination.appendChild(dot);
    });
  }

  // Function to update mobile pagination dots
  function updateMobilePagination() {
    if (!mobilePagination || mobileSlides.length === 0) return;

    mobilePagination.innerHTML = '';
    mobileSlides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `slider-pagination-dot ${index === mobileCurrentIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToMobileSlide(index);
      });
      mobilePagination.appendChild(dot);
    });
  }

  // Function to go to specific desktop slide
  function goToDesktopSlide(index) {
    if (desktopSlides.length === 0) return;
    desktopCurrentIndex = index;
    const translateX = -desktopCurrentIndex * 100;
    desktopSlider.style.transform = `translateX(${translateX}%)`;
    updateDesktopPagination();
    resetDesktopInterval();
  }

  // Function to go to specific mobile slide
  function goToMobileSlide(index) {
    if (mobileSlides.length === 0) return;
    mobileCurrentIndex = index;
    const translateX = -mobileCurrentIndex * 100;
    mobileSlider.style.transform = `translateX(${translateX}%)`;
    updateMobilePagination();
    resetMobileInterval();
  }

  // Function to move desktop slider forward
  function moveDesktopSlider() {
    if (desktopSlides.length === 0) return;

    desktopCurrentIndex = (desktopCurrentIndex + 1) % desktopSlides.length;
    const translateX = -desktopCurrentIndex * 100;
    desktopSlider.style.transform = `translateX(${translateX}%)`;
    updateDesktopPagination();
  }

  // Function to move desktop slider backward
  function moveDesktopSliderBackward() {
    if (desktopSlides.length === 0) return;

    desktopCurrentIndex = (desktopCurrentIndex - 1 + desktopSlides.length) % desktopSlides.length;
    const translateX = -desktopCurrentIndex * 100;
    desktopSlider.style.transform = `translateX(${translateX}%)`;
    updateDesktopPagination();
  }

  // Function to move mobile slider forward
  function moveMobileSlider() {
    if (mobileSlides.length === 0) return;

    mobileCurrentIndex = (mobileCurrentIndex + 1) % mobileSlides.length;
    const translateX = -mobileCurrentIndex * 100;
    mobileSlider.style.transform = `translateX(${translateX}%)`;
    updateMobilePagination();
  }

  // Function to move mobile slider backward
  function moveMobileSliderBackward() {
    if (mobileSlides.length === 0) return;

    mobileCurrentIndex = (mobileCurrentIndex - 1 + mobileSlides.length) % mobileSlides.length;
    const translateX = -mobileCurrentIndex * 100;
    mobileSlider.style.transform = `translateX(${translateX}%)`;
    updateMobilePagination();
  }

  // Function to reset desktop interval
  function resetDesktopInterval() {
    if (desktopInterval) clearInterval(desktopInterval);
    desktopInterval = setInterval(moveDesktopSlider, 5000);
  }

  // Function to reset mobile interval
  function resetMobileInterval() {
    if (mobileInterval) clearInterval(mobileInterval);
    mobileInterval = setInterval(moveMobileSlider, 5000);
  }

  // Initialize sliders
  function initSliders() {
    // Set initial positions
    if (desktopSlider && desktopSlides.length > 0) {
      desktopSlider.style.transform = 'translateX(0%)';
      desktopCurrentIndex = 0;
      updateDesktopPagination();
      // Clear existing interval
      if (desktopInterval) clearInterval(desktopInterval);
      // Start desktop slider
      desktopInterval = setInterval(moveDesktopSlider, 5000);
    }

    if (mobileSlider && mobileSlides.length > 0) {
      mobileSlider.style.transform = 'translateX(0%)';
      mobileCurrentIndex = 0;
      updateMobilePagination();
      // Clear existing interval
      if (mobileInterval) clearInterval(mobileInterval);
      // Start mobile slider
      mobileInterval = setInterval(moveMobileSlider, 5000);
    }
  }

  // Desktop navigation button event listeners
  if (desktopPrevBtn) {
    desktopPrevBtn.addEventListener('click', () => {
      moveDesktopSliderBackward();
      resetDesktopInterval();
    });
  }

  if (desktopNextBtn) {
    desktopNextBtn.addEventListener('click', () => {
      moveDesktopSlider();
      resetDesktopInterval();
    });
  }

  // Mobile navigation button event listeners
  if (mobilePrevBtn) {
    mobilePrevBtn.addEventListener('click', () => {
      moveMobileSliderBackward();
      resetMobileInterval();
    });
  }

  if (mobileNextBtn) {
    mobileNextBtn.addEventListener('click', () => {
      moveMobileSlider();
      resetMobileInterval();
    });
  }

  // Initialize on page load
  window.addEventListener('load', () => {
    initSliders();
  });

  // Reinitialize on resize to handle responsive changes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reset to first slide on resize
      desktopCurrentIndex = 0;
      mobileCurrentIndex = 0;
      if (desktopSlider) desktopSlider.style.transform = 'translateX(0%)';
      if (mobileSlider) mobileSlider.style.transform = 'translateX(0%)';
      updateDesktopPagination();
      updateMobilePagination();
      initSliders();
    }, 250);
  });

  // Pause on hover (optional - can be removed if not needed)
  if (desktopSlider) {
    desktopSlider.parentElement.addEventListener('mouseenter', () => {
      if (desktopInterval) clearInterval(desktopInterval);
    });
    desktopSlider.parentElement.addEventListener('mouseleave', () => {
      resetDesktopInterval();
    });
  }

  if (mobileSlider) {
    mobileSlider.parentElement.addEventListener('touchstart', () => {
      if (mobileInterval) clearInterval(mobileInterval);
    });
    mobileSlider.parentElement.addEventListener('touchend', () => {
      resetMobileInterval();
    });
  }
})();

// ============================================
// Gallery Lightbox Functionality with Navigation
// ============================================
(function () {
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const galleryLightboxImage = document.getElementById('gallery-lightbox-image');
  const galleryImageContainer = document.getElementById('gallery-image-container');
  const galleryLightboxClose = document.getElementById('gallery-lightbox-close');
  const galleryLightboxPrev = document.getElementById('gallery-lightbox-prev');
  const galleryLightboxNext = document.getElementById('gallery-lightbox-next');
  const galleryImages = document.querySelectorAll('.gallery-image[data-gallery-src]');

  // Create array of all gallery image sources
  const galleryImageSources = [];
  galleryImages.forEach((image) => {
    const imageSrc = image.getAttribute('data-gallery-src') || image.getAttribute('src');
    if (imageSrc) {
      galleryImageSources.push(imageSrc);
    }
  });

  let currentImageIndex = 0;

  // Function to update the displayed image with smooth animation
  function updateLightboxImage(index, direction = 'next') {
    if (galleryLightboxImage && galleryImageContainer && galleryImageSources.length > 0) {
      // Remove any existing animation classes from container
      galleryImageContainer.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');

      // Add slide out animation based on direction to container
      if (direction === 'next') {
        galleryImageContainer.classList.add('slide-out-left');
      } else {
        galleryImageContainer.classList.add('slide-out-right');
      }

      // Wait for slide out animation, then update image and slide in
      setTimeout(() => {
        currentImageIndex = index;

        // Preload the new image before displaying
        const newImage = new Image();
        newImage.onload = () => {
          galleryLightboxImage.src = galleryImageSources[currentImageIndex];

          // Remove slide out class and add slide in class to container
          galleryImageContainer.classList.remove('slide-out-left', 'slide-out-right');

          // Add slide in animation based on direction to container
          if (direction === 'next') {
            galleryImageContainer.classList.add('slide-in-right');
          } else {
            galleryImageContainer.classList.add('slide-in-left');
          }

          // Remove animation class after animation completes
          setTimeout(() => {
            galleryImageContainer.classList.remove('slide-in-left', 'slide-in-right');
          }, 400);
        };
        newImage.src = galleryImageSources[currentImageIndex];
      }, 150);
    }
  }

  // Function to open lightbox
  function openLightbox(imageSrc) {
    if (galleryLightbox && galleryLightboxImage && galleryImageSources.length > 0) {
      // Find the index of the clicked image
      const index = galleryImageSources.indexOf(imageSrc);
      if (index !== -1) {
        currentImageIndex = index;
        // Set image source immediately
        galleryLightboxImage.src = galleryImageSources[currentImageIndex];
        // Remove all animation classes from container
        if (galleryImageContainer) {
          galleryImageContainer.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right', 'open-from-zero');
        }
      } else {
        // Fallback if image not found in array
        galleryLightboxImage.src = imageSrc;
        currentImageIndex = 0;
      }

      // Remove closing class if present
      galleryLightbox.classList.remove('closing', 'hidden');

      // Use requestAnimationFrame to ensure display change happens before animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          galleryLightbox.classList.add('show');
          // Add open-from-zero animation to container
          if (galleryImageContainer) {
            // Reset container to initial state
            galleryImageContainer.style.width = '0';
            galleryImageContainer.style.height = '0';
            galleryImageContainer.style.minWidth = '0';
            galleryImageContainer.style.minHeight = '0';
            // Trigger animation
            requestAnimationFrame(() => {
              galleryImageContainer.classList.add('open-from-zero');
              // Remove animation class and reset styles after it completes
              setTimeout(() => {
                galleryImageContainer.classList.remove('open-from-zero');
                galleryImageContainer.style.width = '';
                galleryImageContainer.style.height = '';
                galleryImageContainer.style.minWidth = '';
                galleryImageContainer.style.minHeight = '';
              }, 500);
            });
          }
        }, 10);
        // Prevent body scroll when lightbox is open
        document.body.classList.add('lightbox-open');
      });
    }
  }

  // Function to close lightbox
  function closeLightbox() {
    if (galleryLightbox) {
      // Add closing class for close animation
      galleryLightbox.classList.add('closing');
      galleryLightbox.classList.remove('show');

      // Wait for animation to complete before hiding
      setTimeout(() => {
        galleryLightbox.classList.remove('closing');
        galleryLightbox.classList.add('hidden');
        // Restore body scroll
        document.body.classList.remove('lightbox-open');
      }, 300);
    }
  }

  // Function to show previous image
  function showPreviousImage() {
    if (galleryImageSources.length > 0) {
      const newIndex = (currentImageIndex - 1 + galleryImageSources.length) % galleryImageSources.length;
      updateLightboxImage(newIndex, 'prev');
    }
  }

  // Function to show next image
  function showNextImage() {
    if (galleryImageSources.length > 0) {
      const newIndex = (currentImageIndex + 1) % galleryImageSources.length;
      updateLightboxImage(newIndex, 'next');
    }
  }

  // Add click event listeners to gallery images
  galleryImages.forEach((image) => {
    image.addEventListener('click', () => {
      const imageSrc = image.getAttribute('data-gallery-src') || image.getAttribute('src');
      if (imageSrc) {
        openLightbox(imageSrc);
      }
    });
  });

  // Close lightbox on close button click
  if (galleryLightboxClose) {
    galleryLightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Previous button click handler
  if (galleryLightboxPrev) {
    galleryLightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showPreviousImage();
    });
  }

  // Next button click handler
  if (galleryLightboxNext) {
    galleryLightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextImage();
    });
  }

  // Close lightbox when clicking outside the image (on backdrop)
  if (galleryLightbox) {
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (galleryLightbox && galleryLightbox.classList.contains('show')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    }
  });
})();

// Ritz Media World Link Handler
const rmwLink = document.getElementById('rmwLink');
if (rmwLink) {
  rmwLink.addEventListener('click', () => {
    window.open('https://ritzmediaworld.com/', '_blank');
  });
}



// ============================================
// Custom Notification Popup
// ============================================
function createNotificationPopup() {
  // Remove existing notification if any
  const existing = document.getElementById('custom-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'custom-notification';
  notification.className = 'fixed top-4 right-4 z-[9999] transform translate-x-full transition-transform duration-300';
  notification.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl p-6 min-w-[300px] max-w-[400px] border-l-4">
      <div class="flex items-start gap-4">
        <div class="notification-icon flex-shrink-0"></div>
        <div class="flex-1">
          <h3 class="font-semibold text-lg mb-1 notification-title"></h3>
          <p class="text-sm text-gray-600 notification-message"></p>
        </div>
        <button class="notification-close text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  return notification;
}

function showNotification(type, title, message) {
  const notification = createNotificationPopup();
  const iconDiv = notification.querySelector('.notification-icon');
  const titleEl = notification.querySelector('.notification-title');
  const messageEl = notification.querySelector('.notification-message');
  const borderEl = notification.querySelector('.border-l-4');
  const closeBtn = notification.querySelector('.notification-close');

  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Set styles based on type
  if (type === 'success') {
    borderEl.classList.add('border-green-500');
    iconDiv.innerHTML = '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  } else if (type === 'error') {
    borderEl.classList.add('border-red-500');
    iconDiv.innerHTML = '<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  } else {
    borderEl.classList.add('border-blue-500');
    iconDiv.innerHTML = '<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  }

  // Show notification
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  // Auto hide after 5 seconds
  const autoHide = setTimeout(() => {
    hideNotification(notification);
  }, 5000);

  // Close button handler
  closeBtn.addEventListener('click', () => {
    clearTimeout(autoHide);
    hideNotification(notification);
  });
}

function hideNotification(notification) {
  notification.classList.add('translate-x-full');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// ============================================
// Loading Popup Modal
// ============================================
function createLoadingPopup() {
  // Remove existing loading popup if any
  const existing = document.getElementById('loading-popup');
  if (existing) existing.remove();

  const loadingPopup = document.createElement('div');
  loadingPopup.id = 'loading-popup';
  loadingPopup.className = 'fixed inset-0 z-[9999] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center';
  loadingPopup.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-[400px] w-[90%] mx-4 flex flex-col items-center justify-center gap-6">
      <div class="relative">
        <svg class="animate-spin h-16 w-16 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div class="text-center">
        <h3 class="font-semibold text-xl md:text-2xl text-gray-800 mb-2 font-open-sans">Submitting...</h3>
        <p class="text-sm md:text-base text-gray-600 font-open-sans">Please wait while we process your request</p>
      </div>
    </div>
  `;
  document.body.appendChild(loadingPopup);
  
  // Prevent body scroll when loading popup is open
  document.body.style.overflow = 'hidden';
  
  return loadingPopup;
}

function showLoadingPopup() {
  return createLoadingPopup();
}

function hideLoadingPopup() {
  const loadingPopup = document.getElementById('loading-popup');
  if (loadingPopup) {
    // Fade out animation
    loadingPopup.style.opacity = '0';
    loadingPopup.style.transition = 'opacity 0.3s ease-out';
    
    setTimeout(() => {
      if (loadingPopup.parentNode) {
        loadingPopup.parentNode.removeChild(loadingPopup);
      }
      // Restore body scroll
      document.body.style.overflow = '';
    }, 300);
  }
}

// ============================================
// Form Validation
// ============================================
function validateForm(form) {
  const errors = [];
  if (!form) {
    return { isValid: false, errors: ['Form not found'] };
  }
  
  const inputs = form.querySelectorAll('input[required], textarea[required]');

  inputs.forEach(input => {
    // Remove previous error styling
    input.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
    
    // Force read the current value directly from DOM element
    // Use getAttribute and value to ensure we get the latest value
    let rawValue = '';
    if (input.tagName === 'TEXTAREA') {
      rawValue = input.value || '';
    } else {
      rawValue = input.value || '';
    }
    
    const value = String(rawValue).trim();
    const type = input.type || 'text';
    const nameAttr = input.name || '';
    const placeholder = input.placeholder || '';
    
    // Get field label from placeholder (remove * and extra spaces)
    let fieldLabel = placeholder.replace(/\*/g, '').trim();
    if (!fieldLabel) {
      // Fallback to name attribute with proper formatting
      if (nameAttr === 'name') fieldLabel = 'Your Name';
      else if (nameAttr === 'email') fieldLabel = 'Your Email';
      else if (nameAttr === 'phone') fieldLabel = 'Your Phone';
      else if (nameAttr === 'message') fieldLabel = 'Message';
      else fieldLabel = 'This field';
    }

    // Check if empty - only if required attribute exists
    if (input.hasAttribute('required')) {
      if (!value || value.length === 0) {
        errors.push(`${fieldLabel} is required`);
        input.classList.add('border-red-500', 'ring-2', 'ring-red-500');
        return; // Skip further validation for this field
      }
    }

    // Email validation
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Please enter a valid email address');
        input.classList.add('border-red-500', 'ring-2', 'ring-red-500');
      }
    }

    // Phone validation
    if (type === 'tel' || nameAttr === 'phone') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errors.push('Please enter a valid phone number');
        input.classList.add('border-red-500', 'ring-2', 'ring-red-500');
      }
    }

    // Name validation (minimum 2 characters)
    if (nameAttr === 'name' && value.length < 2) {
      errors.push('Name must be at least 2 characters long');
      input.classList.add('border-red-500', 'ring-2', 'ring-red-500');
    }

    // Message validation (minimum 10 characters)
    if (nameAttr === 'message' && value.length < 10) {
      errors.push('Message must be at least 10 characters long');
      input.classList.add('border-red-500', 'ring-2', 'ring-red-500');
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// Google Sheets Integration (No-CORS Mode)
// ============================================
async function sendDataToGoogleSheet(form, button) {
  const url = "https://script.google.com/macros/s/AKfycbzrQtVX_bykE60rKkinchfNbh0ADAcvGf0OO89-vmW-qNsAaBfHN72GgJh1n0KfMVrIgg/exec";

  // Get form data
  const nameInput = form.querySelector('input[name="name"], input[placeholder*="Name"]');
  const emailInput = form.querySelector('input[type="email"], input[name="email"], input[placeholder*="Email"]');
  const phoneInput = form.querySelector('input[type="tel"], input[name="phone"], input[placeholder*="Phone"]');
  const messageInput = form.querySelector('textarea[name="message"], input[name="message"], textarea[placeholder*="Message"], input[placeholder*="Message"]');

  const payload = {
    sheetName: "Sheet1",
    name: nameInput ? nameInput.value.trim() : '',
    email: emailInput ? emailInput.value.trim() : '',
    phone: phoneInput ? phoneInput.value.trim() : '',
    message: messageInput ? messageInput.value.trim() : '',
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    leadLocation: "Website"
  };

  // Disable button during submission
  if (button) {
    button.disabled = true;
  }

  // Show loading popup
  showLoadingPopup();

  try {
    // Use no-cors mode - this prevents CORS issues but we can't get response
    await fetch(url, {
      method: "POST",
      mode: "no-cors", // ⭐ IMPORTANT: no-cors mode
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Hide loading popup after a short delay to ensure request is sent
    setTimeout(() => {
      hideLoadingPopup();
      
      // Re-enable button
      if (button) {
        button.disabled = false;
      }
      
      // Since no-cors doesn't return response, we assume success
      // Show success notification
      showNotification('success', 'Success!', 'Thank you! We will get back to you shortly.');
      
      // Mark form as submitted in session storage (prevents popup from opening again)
      setFormSubmitted();
      
      // Reset form
      form.reset();
      
      // Remove error styling
      form.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
      });

      // Close popup if it's the popup form
      if (form.id === 'popup-form') {
        setTimeout(() => {
          closePopup();
        }, 1500);
      }
    }, 800); // Delay to ensure request is sent and show loading state

  } catch (error) {
    console.error("Request Failed:", error);
    hideLoadingPopup();
    
    // Re-enable button
    if (button) {
      button.disabled = false;
    }
    
    showNotification('error', 'Error', 'Something went wrong! Please check your connection and try again.');
  }
}

// ============================================
// Form Submission Handlers
// ============================================
function initializeFormHandlers() {
  // Get all forms
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Find submit button
      const submitButton = form.querySelector('button[type="submit"]');
      
      // Validate form - read values directly from DOM
      const validation = validateForm(form);
      
      if (!validation.isValid) {
        showNotification('error', 'Validation Error', validation.errors[0]);
        return;
      }

      // Submit form
      await sendDataToGoogleSheet(form, submitButton);
    });
  });

  // Also handle button clicks for forms without submit type
  document.querySelectorAll('form button').forEach(button => {
    if (button.type !== 'submit') {
      button.addEventListener('click', async (e) => {
        const form = button.closest('form');
        if (!form) return;
        
        e.preventDefault();
        
        // Validate form
        const validation = validateForm(form);
        
        if (!validation.isValid) {
          showNotification('error', 'Validation Error', validation.errors[0]);
          return;
        }

        // Submit form
        await sendDataToGoogleSheet(form, button);
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFormHandlers);
} else {
  initializeFormHandlers();
}
