'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const nav = document.querySelector('.nav');

//
// Modal window
const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach((btn) => {
  btn.addEventListener('click', openModal);
});

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

//
// Smooth scroll
btnScrollTo.addEventListener('click', function () {
  // ol' school
  // const s1coords = section1.getBoundingClientRect();

  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  section1.scrollIntoView({ behavior: 'smooth' });
});

// Page Navigation
// without event delegation
// document.querySelectorAll('.nav__link').forEach((link) => {
//   link.addEventListener('click', function (e) {
//     e.preventDefault();
//     // can't use this.href -> it will give absolute path
//     const id = this.getAttribute('href'); // relative path
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// with event delegation (more effective and efficient)
// 1. add event listener to common parent element
// 2. determine what element originated the event
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  // if (e.target !== e.currentTarget) {
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

//
// Tabbed component
tabsContainer.addEventListener('click', function (e) {
  e.preventDefault();

  const clickedTab = e.target.closest('.operations__tab');
  if (!clickedTab) return;

  // active tab css class switch
  // tabs.forEach((tab) => {
  //   tab === clickedTab
  //     ? tab.classList.add('operations__tab--active')
  //     : tab.classList.remove('operations__tab--active');
  // });

  // // active content switch
  // tabsContent.forEach((content) => {
  //   const tabId = clickedTab.dataset.tab;
  //   content.classList.contains(`operations__content--${tabId}`)
  //     ? content.classList.add('operations__content--active')
  //     : content.classList.remove('operations__content--active');
  // });

  // solution without forEach
  // will not work if no tab/content active after rendering
  const activeTab = document.querySelector('.operations__tab--active');
  const activeTabContent = document.querySelector(
    '.operations__content--active',
  );
  const clickedTabContent = document.querySelector(
    `.operations__content--${clickedTab.dataset.tab}`,
  );

  if (clickedTab !== activeTab) {
    // active tab switch
    activeTab.classList.remove('operations__tab--active');
    clickedTab.classList.add('operations__tab--active');

    // active content switch
    activeTabContent.classList.remove('operations__content--active');
    clickedTabContent.classList.add('operations__content--active');
  }
});

//
// Fade effect in top nav
const handleHover = function (opacity) {
  // returns new function
  // opacity becomes closure for returning function
  return function (e) {
    if (e.target.classList.contains('nav__link')) {
      const link = e.target;
      const siblings = link.closest('.nav').querySelectorAll('.nav__link');
      const logo = link.closest('.nav').querySelector('img');

      siblings.forEach((el) => {
        if (el !== link) {
          el.style.opacity = opacity;
        }
      });

      logo.style.opacity = opacity;
    }
  };
};
// use mouseover -> mouseenter not bubbling
nav.addEventListener('mouseover', handleHover(0.5));
nav.addEventListener('mouseout', handleHover(1));

//
// Sticky navigation
const header = document.querySelector('.header');
const havHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  !entry.isIntersecting
    ? nav.classList.add('sticky')
    : nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${havHeight}px`, // fire callback earlier on X px
});

headerObserver.observe(header);

//
// Section revealing
// Section move-up effect when scrolling
const allSection = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries; // threshold in IntersectionObserver options

  if (entry.isIntersecting) {
    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);
  }
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSection.forEach((section) => {
  // need to hide sections before
  // not done it in html because if JS is turned off
  // the sections can't be seen
  // section.classList.add('section--hidden');

  // add observer to each section
  sectionObserver.observe(section);
});

//
// Lazy loading imgs
// need two imgs ->
// one with small size and resolution (with css blur effect)
// second full-res img

const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (entry.isIntersecting) {
    entry.target.src = entry.target.dataset.src;
    // can't remove it right away
    // entry.target.classList.remove('lazy-img');
    // because new img will load behind the scene
    // and will replace the old one only after loading
    // so the all loading time will be the older ugly img
    // without the filter
    entry.target.onload = function () {
      entry.target.classList.remove('lazy-img');
    };
    observer.unobserve(entry.target);
  }
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  // fire-up earlier to not show the user the process
  rootMargin: '100px',
});

imgTargets.forEach((img) => imgObserver.observe(img));

//
// Slider functionality
const slider = (function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnLRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');
  const maxSlidesIndex = slides.length - 1;

  let currentSlide;

  const createDots = function () {
    // _ - convention "not used variable"
    slides.forEach((_, index) => {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${index}"></button>`,
      );
    });
  };

  const activeDot = function (slide) {
    const dots = document.querySelectorAll('.dots__dot');
    dots.forEach((dot) => {
      Number(dot.dataset.slide) === slide
        ? dot.classList.add('dots__dot--active')
        : dot.classList.remove('dots__dot--active');
    });
  };

  const gotToSlide = (slideNum) => {
    // move slides
    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${(index - slideNum) * 100}%)`;
    });

    // change active dot
    activeDot(slideNum);
  };

  // prev slide
  const prevSlide = function () {
    currentSlide = currentSlide === 0 ? maxSlidesIndex : --currentSlide;

    gotToSlide(currentSlide);
  };

  btnLeft.addEventListener('click', prevSlide);

  // next slide
  const nextSlide = function () {
    currentSlide = currentSlide === maxSlidesIndex ? 0 : ++currentSlide;

    gotToSlide(currentSlide);
  };

  btnLRight.addEventListener('click', nextSlide);

  // slider navigation with arrow keys
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    }
    if (e.key === 'ArrowRight') {
      nextSlide();
    }
    // with short circuiting
    // e.key === 'ArrowLeft' && prevSlide();
    // e.key === 'ArrowRight' && nextSlide();
  });

  // dots functionality
  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const slideNum = Number(e.target.dataset.slide);
      gotToSlide(slideNum);
    }
  });

  // init slider
  function init(initSlideNum) {
    currentSlide = initSlideNum;
    createDots();
    gotToSlide(initSlideNum);
  }

  init(0);
  //
})();
