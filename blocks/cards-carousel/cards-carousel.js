/* eslint-disable no-loop-func */
/* eslint-disable func-names */
const SLIDE_ID_PREFIX = 'cards-carousel-slide';
const SLIDE_CONTROL_ID_PREFIX = 'cards-carousel-slide-control';

let curSlide = 0;
let maxSlide = 0;
let slideShow = 3;

function scrollToSlide(carouselWrapper, slideIndex) {
  const carouselSlider = carouselWrapper.querySelector('.cards-carousel-slide-container');
  const leftPos = (carouselSlider.clientWidth / slideShow) * slideIndex;
  carouselSlider.scrollTo({ left: leftPos, behavior: 'smooth' });
  const slides = carouselSlider.children;
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    const isActive = i === slideIndex;
    slide.setAttribute('tabindex', isActive ? '-1' : '-1');
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  }
  curSlide = slideIndex;
}

function buildNav(dir) {
  const nav = document.createElement('div');
  nav.classList.add('carousel-nav', `carousel-nav-${dir}`);
  nav.addEventListener('click', () => {
    let nextSlide = curSlide + (dir === 'prev' ? -1 : 1);
    if (nextSlide < 0) nextSlide = maxSlide;
    else if (nextSlide > maxSlide) nextSlide = 0;
    scrollToSlide(nav.closest('.cards-carousel'), nextSlide);
  });
  return nav;
}

function buildSlide(slide, index) {
  [...slide.children].forEach((div) => {
    div.className = div.children.length === 1 && div.querySelector('picture') ? 'cards-card-image' : 'cards-card-body';
  });
  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  slide.classList.add('cards-carousel-slide');
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-describedby', `${SLIDE_CONTROL_ID_PREFIX}${index}`);
  slide.setAttribute('tabindex', index === 0 ? '-1' : '-1');
  const href = slide.querySelector('a')?.href;
  if (href) {
    slide.classList.add('card-with-link');
    slide.addEventListener('click', () => {
      document.location.href = href;
    });
  }
  return slide;
}

function makeCarouselDraggable(carousel) {
  let isDown = false; let startX = 0; let startScroll = 0; let
    prevScroll = 0;

  const getDragXPosition = (e) => (e.type.startsWith('touch') ? e.touches[0].pageX : e.pageX);

  const handleDragStart = (e) => {
    isDown = true;
    startX = getDragXPosition(e);
    startScroll = carousel.scrollLeft;
    prevScroll = startScroll;
  };

  const handleDragEnd = () => {
    isDown = false;
  };

  const handleDragMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = getDragXPosition(e);
    const walk = x - startX;
    carousel.scrollLeft = prevScroll - walk;
  };

  carousel.addEventListener('mousedown', handleDragStart);
  carousel.addEventListener('touchstart', handleDragStart, { passive: true });
  carousel.addEventListener('mouseleave', handleDragEnd);
  carousel.addEventListener('mouseup', handleDragEnd);
  carousel.addEventListener('touchend', handleDragEnd);
  carousel.addEventListener('mousemove', handleDragMove);
  carousel.addEventListener('touchmove', handleDragMove, { passive: true });
}

function calculateSlideShow(defaultVariant) {
  const totalWidth = window.innerWidth;
  if (totalWidth >= 992) slideShow = defaultVariant ? 1 : 3;
  else if (totalWidth >= 767) slideShow = 2;
  else slideShow = 1;
}

function responsiveHandler(slideLength, defaultVariant) {
  calculateSlideShow(defaultVariant);
  const mediaQueries = [
    { min: 992, slides: defaultVariant ? 1 : 3 },
    { min: 767, max: 992, slides: defaultVariant ? 1 : 2 },
    { min: 640, max: 767, slides: defaultVariant ? 2 : 1 },
    { max: 640, slides: 1 },
  ];

  mediaQueries.forEach((query) => {
    const mql = window.matchMedia(`(min-width: ${query.min}px)${query.max ? ` and (max-width: ${query.max}px)` : ''}`);
    const handleChange = () => {
      if (mql.matches) {
        slideShow = query.slides;
      }
    };
    mql.addEventListener('change', handleChange);
    handleChange();
  });
}

export default function decorate(block) {
  const carousel = document.createElement('div');
  carousel.classList.add('cards-carousel-slide-container');
  makeCarouselDraggable(carousel);
  const slides = [...block.children];
  maxSlide = slides.length - 1;
  slides.forEach((slide, index) => carousel.appendChild(buildSlide(slide, index)));
  block.append(carousel);
  block.prepend(buildNav('prev'));
  block.append(buildNav('next'));
  responsiveHandler(slides.length, block.classList.contains('feature'));
}
