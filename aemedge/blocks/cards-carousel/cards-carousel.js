/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable func-names */

import { getFeaturesArray, checkFeatureFlags } from '../../scripts/utils.js';
import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';
import { ingestAnalytics, makeFinalPayload } from '../../scripts/analytics.js';

const SLIDE_ID_PREFIX = 'cards-carousel-slide';
const SLIDE_CONTROL_ID_PREFIX = 'cards-carousel-slide-control';

let curSlide = 0;
let maxSlide = 0;
let filteredSlides = 0;

function updateNavButtons(carouselWrapper) {
  const carouselSlider = carouselWrapper.querySelector('.cards-carousel-slide-container');
  const { scrollLeft } = carouselSlider;
  const maxScrollLeft = carouselSlider.scrollWidth - carouselSlider.clientWidth;

  if (scrollLeft <= 0) {
    carouselWrapper.classList.add('hide-prev');
    carouselWrapper.classList.remove('hide-next');
  } else if (scrollLeft >= maxScrollLeft) {
    carouselWrapper.classList.add('hide-next');
    carouselWrapper.classList.remove('hide-prev');
  } else {
    carouselWrapper.classList.remove('hide-prev');
    carouselWrapper.classList.remove('hide-next');
  }
}

function scrollToSlide(carouselWrapper, slideIndex, dir) {
  const carouselSlider = carouselWrapper.querySelector('.cards-carousel-slide-container');
  const widthtoScroll = (carouselSlider.clientWidth > 767) ? 350 : 170;
  let leftPos;
  if (widthtoScroll === 350) {
    leftPos = (widthtoScroll * 2 * slideIndex) + (dir === 'prev' ? -50 : 50);
  } else {
    leftPos = (widthtoScroll * 2 * slideIndex);
  }
  carouselSlider.scrollTo({ left: leftPos, behavior: 'smooth' });
  const slides = carouselSlider.children;
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    const isActive = i === slideIndex;
    slide.setAttribute('tabindex', isActive ? '-1' : '-1');
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  }
  curSlide = slideIndex;
  updateNavButtons(carouselWrapper);
}

function buildNav(dir, carousel) {
  // eslint-disable-next-line max-len
  const slidesDisplayed = Math.floor(carousel.clientWidth > 767 ? carousel.clientWidth / 350 : carousel.clientWidth / 170);
  if (filteredSlides <= slidesDisplayed) {
    return null;
  }
  const nav = document.createElement('div');
  nav.classList.add('carousel-nav', `carousel-nav-${dir}`);
  nav.addEventListener('click', () => {
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
    scrollToSlide(carousel, nextSlide, dir);
  });
  return nav;
}

function buildSlide(slide, index, featuresArray) {
  const divs = [...slide.children];

  const imageDiv = divs[0];
  if (imageDiv && imageDiv.querySelector('picture')) {
    imageDiv.className = 'cards-card-image';
    const img = imageDiv.querySelector('img').src;
    const { alt } = imageDiv.querySelector('img');
    imageDiv.querySelector('picture').replaceWith(createOptimizedPicture(img, alt, false, [{ width: '350' }]));
  }

  const bodyDiv = divs[1];
  if (bodyDiv) {
    bodyDiv.className = 'cards-card-body';
  }

  // Handle feature flags (Third div)
  const featureFlagDiv = divs[2];
  if (featureFlagDiv) {
    const featureFlagText = featureFlagDiv.innerText.trim().toLowerCase();
    const isFeatureEnabled = checkFeatureFlags(featureFlagText, featuresArray, window.profile);

    if (!isFeatureEnabled) {
      return null;
    }
    featureFlagDiv.remove(); // Remove the feature flag div from the DOM
  }

  const video = imageDiv.querySelector('a');
  if (video) {
    const image = imageDiv.querySelector('img');
    const picture = imageDiv.querySelector('picture');
    const videoLink = video.href;
    const videoEl = document.createElement('video');
    videoEl.src = videoLink;
    videoEl.controls = false;
    videoEl.autoplay = false;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsinline = true;
    videoEl.className = 'cards-card-video hide';
    video.parentElement.replaceWith(videoEl);
    picture.parentElement.replaceWith(image);

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

    imageDiv.parentElement.prepend(videoEl);
    imageDiv.parentElement.prepend(image);
  }

  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  slide.classList.add('cards-carousel-slide');
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-describedby', `${SLIDE_CONTROL_ID_PREFIX}${index}`);
  slide.setAttribute('tabindex', '-1');

  const link = slide.querySelector('a');
  if (link) {
    const linkWrapper = document.createElement('div');
    linkWrapper.classList.add('card-link');
    linkWrapper.append(link.parentElement);
    slide.append(linkWrapper);

    const { href } = link;
    if (href) {
      slide.classList.add('card-with-link');
      slide.addEventListener('click', () => {
        document.location.href = href;
        const analyticsEvent = makeFinalPayload({
          'event.subcategory': 'Landing Page',
          'event.subtype': 'feature',
          'event.type': 'click',
          'event.value': slide.querySelector('.cards-card-body h3').innerText,
        });
        ingestAnalytics([analyticsEvent]);
      });
    }
  }

  filteredSlides += 1;
  return slide;
}

export default async function decorate(block) {
  decorateIcons(block);
  const featuresArray = await getFeaturesArray();
  const carousel = document.createElement('div');
  carousel.classList.add('cards-carousel-slide-container');
  const slides = [...block.children];
  maxSlide = slides.length - 1;
  slides.forEach((slide, index) => {
    const builtSlide = buildSlide(slide, index, featuresArray);
    if (builtSlide) {
      carousel.appendChild(builtSlide);
    } else {
      slide.remove();
    }
  });
  block.append(carousel);
  block.classList.add('hide-prev');
  setTimeout(() => {
    const prevButton = buildNav('prev', block);
    const nextButton = buildNav('next', block);
    if (prevButton && nextButton) {
      block.prepend(buildNav('prev', block));
      block.append(buildNav('next', block));
    }
  }, 0);
  carousel.addEventListener('scroll', () => updateNavButtons(block));
}
