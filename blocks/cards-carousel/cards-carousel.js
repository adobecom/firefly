/* eslint-disable no-loop-func */
/* eslint-disable func-names */
import { decorateIcons } from '../../scripts/utils.js';

const SLIDE_ID_PREFIX = 'cards-carousel-slide';
const SLIDE_CONTROL_ID_PREFIX = 'cards-carousel-slide-control';

let curSlide = 0;
let maxSlide = 0;

function scrollToSlide(carouselWrapper, slideIndex) {
  const carouselSlider = carouselWrapper.querySelector('.cards-carousel-slide-container');
  const widthtoScroll = (carouselSlider.clientWidth > 767) ? 350 : 170;
  const leftPos = (widthtoScroll * 2 * slideIndex);
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
    const carousel = nav.closest('.cards-carousel');
    // eslint-disable-next-line max-len
    const slidesDisplayed = Math.floor(carousel.clientWidth > 767 ? carousel.clientWidth / 350 : carousel.clientWidth / 170);
    const nextSlide = curSlide + (dir === 'prev' ? -1 : 1);
    if (nextSlide <= 0) {
      carousel.classList.add('hide-prev');
      carousel.classList.remove('hide-next');
    } else if ((nextSlide + slidesDisplayed) >= maxSlide) {
      carousel.classList.add('hide-next');
      carousel.classList.remove('hide-prev');
    } else {
      carousel.classList.remove('hide-prev');
      carousel.classList.remove('hide-next');
    }
    scrollToSlide(carousel, nextSlide);
  });
  return nav;
}

function buildSlide(slide, index) {
  [...slide.children].forEach((div) => {
    div.className = div.querySelector('picture') ? 'cards-card-image' : 'cards-card-body';
  });
  const firstDiv = slide.querySelector('div');
  const video = firstDiv.querySelector('a');
  if (video) {
    const image = firstDiv.querySelector('img');
    const videoLink = video.href;
    const videoEl = document.createElement('video');
    videoEl.src = videoLink;
    videoEl.controls = false; // Hide video controls
    videoEl.autoplay = false;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsinline = true;
    videoEl.className = 'cards-card-video hide';
    firstDiv.replaceWith(videoEl);
    slide.prepend(image);

    slide.addEventListener('mouseenter', () => {
      videoEl.classList.remove('hide');
      videoEl.play();
      image.classList.add('hide');
    });

    slide.addEventListener('mouseleave', () => {
      videoEl.pause();
      videoEl.classList.add('hide');
      image.classList.remove('hide');
    });

    slide.addEventListener('focusout', () => {
      videoEl.pause();
      videoEl.classList.add('hide');
      image.classList.remove('hide');
    });
  }
  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  slide.classList.add('cards-carousel-slide');
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-describedby', `${SLIDE_CONTROL_ID_PREFIX}${index}`);
  slide.setAttribute('tabindex', index === 0 ? '-1' : '-1');
  const link = slide.querySelector('a');
  const linkWrapper = document.createElement('div');
  linkWrapper.classList.add('card-link');
  linkWrapper.append(link.parentElement);
  slide.append(linkWrapper);
  const icon = slide.querySelector('.icon');
  if (icon) {
    icon.parentElement.replaceWith(icon);
  }
  const href = link?.href;
  if (href) {
    slide.classList.add('card-with-link');
    slide.addEventListener('click', () => {
      document.location.href = href;
    });
  }
  return slide;
}

export default function decorate(block) {
  decorateIcons(block);
  const carousel = document.createElement('div');
  carousel.classList.add('cards-carousel-slide-container');
  const slides = [...block.children];
  maxSlide = slides.length - 1;
  slides.forEach((slide, index) => carousel.appendChild(buildSlide(slide, index)));
  block.append(carousel);
  block.classList.add('hide-prev');
  block.prepend(buildNav('prev'));
  block.append(buildNav('next'));
}
