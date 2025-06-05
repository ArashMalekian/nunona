
document.addEventListener('alpine:init', () => {
    Alpine.data('TestimonialsCarousel', () => ({
        $section: null,
        swiper: null,
        mounted() {
            let am = this;
            am.InitCarousel()
        },
        InitCarousel() {
            let am = this;
            am.$section = am.$el;

            let slides_per_view = am.$section.dataset.slides_per_view;
            let slides_per_view_desk = am.$section.dataset.slides_per_view_desk;
            let auto_play = am.$section.dataset.auto_play == 'true';
            let show_arrows = am.$section.dataset.show_arrows == 'true';

            let sw_config = {
                initialSlide: 0,
                autoHeight: true,
                loop: true,
                slidesPerView: slides_per_view,
                spaceBetween: 25,
                pagination: {
                    el: am.$section.querySelector('.swiper-pagination'),
                    type: 'bullets',
                    clickable: true
                },
                speed: 500,
                breakpoints: {
                    900: {
                        slidesPerView: slides_per_view_desk,
                        slidesPerGroup: slides_per_view_desk
                    }
                }
            };

            if (show_arrows) {
                sw_config['navigation'] = {
                    nextEl: am.$section.querySelector('.swiper-button-next'),
                    prevEl: am.$section.querySelector('.swiper-button-prev'),
                }
            }

            if (auto_play) {
                sw_config['autoplay'] = {
                    delay: 5000
                };
            }

            // console.log(sw_config)
            am.swiper = new Swiper(am.$section, sw_config);
        }
    }));

    Alpine.data('CustomVideoAutoPlay', () => ({
        mounted() {
            let am = this;
            am.PlayVideo();
        },
        PlayVideo() {
            let am = this;
            let $video = am.$el.querySelector('video');
            $video.controls = false;
            $video.muted = true;
            $video.loop = true;
            $video.play();
        }
    }));

    Alpine.data('ProductSelection', () => ({
        mounted() {
            let am = this;
            am.$el.addEventListener('change', (e) => {
                // console.log(e);
                let $form = am.$el.closest('.product-purchase-form');
                let $variant_id = $form.querySelector('[name=id]');
                let $selling_plan = $form.querySelector('[name=selling_plan]');
                let $product_detail = $form.closest('.product-detail');
                let $title = $product_detail.querySelector('.product-area__details__title');
                let $compare_price = $product_detail.querySelector('.was-price');
                let $price = $product_detail.querySelector('.price');

                if ($variant_id) {
                    $variant_id.value = e.target.dataset.variant_id;
                }
                if ($selling_plan) {
                    $selling_plan.value = e.target.dataset.selling_plan;
                }
                if ($title) {
                    $title.innerText = e.target.dataset.product_title;
                }
                if ($compare_price) {
                    $compare_price.innerText = e.target.dataset.variant_compare_price;
                }
                if ($price) {
                    $price.innerText = e.target.dataset.variant_price;
                }
            });

            // Preselect second option
            let $second_option = am.$el.querySelectorAll('[name=option-select]')[1];
            if (!$second_option) return;
            setTimeout(() => {
                $second_option.checked = true;
                $second_option.dispatchEvent(new Event('change', {bubbles: true}));
            }, 0);
        }
    }));

    Alpine.data('CustomMediaGallery', () => ({
        cache: {},
        sw_main: null,
        sw_thumbs: null,
        init() {
            let am = this;
            am.InitSelf()
            am.InitGallery()
        },
        InitSelf() {
            let am = this;
            am.cache.$gallery = am.$el.querySelector('.cg-media')
            am.cache.$thumbs = am.$el.querySelector('.cg-media-thumbs')
        },  
        InitCarousel() {
            let am = this;
            am.$section = am.$el;

            let slides_per_view = am.$section.dataset.slides_per_view;
            let slides_per_view_desk = am.$section.dataset.slides_per_view_desk;
            let auto_play = am.$section.dataset.auto_play == 'true';
            let show_arrows = am.$section.dataset.show_arrows == 'true';

            let sw_config = {
                initialSlide: 0,
                autoHeight: true,
                loop: true,
                slidesPerView: slides_per_view,
                spaceBetween: 25,
                pagination: {
                    el: am.$section.querySelector('.swiper-pagination'),
                    type: 'bullets',
                    clickable: true
                },
                speed: 500,
                breakpoints: {
                    900: {
                        slidesPerView: slides_per_view_desk,
                        slidesPerGroup: slides_per_view_desk
                    }
                }
            };

            if (show_arrows) {
                sw_config['navigation'] = {
                    nextEl: am.$section.querySelector('.swiper-button-next'),
                    prevEl: am.$section.querySelector('.swiper-button-prev'),
                }
            }

            if (auto_play) {
                sw_config['autoplay'] = {
                    delay: 5000
                };
            }

            am.swiper = new Swiper(am.$section, sw_config);
        },
        InitGallery() {
            let am = this;
            if (am.cache.$thumbs.querySelectorAll('.swiper-slide').length > 6) {
                am.sw_thumbs = new Swiper(am.cache.$thumbs, {
                    loop: false,
                    freeMode: true,
                    slidesPerView: 6,
                    watchSlidesProgress: true,
                    on: {
                        init() {
                            am.cache.$thumbs.classList.add('swiper-initialized')
                        }
                    }
                });
            }

            am.sw_main = new Swiper(am.cache.$gallery, {
                loop: true,
                thumbs: {
                    swiper: am.sw_thumbs,
                },
                on: {
                    init() {
                        am.cache.$gallery.classList.add('swiper-initialized')
                    },
                    slideChange() {
                        am.$nextTick(() => {
                            let $activeSlide = am.cache.$gallery.querySelector('.swiper-slide-active')
                            let mediaId = $activeSlide.dataset.mediaId
                            let thumb_active_class = 'thumb-active'
                            let $activeThumb = am.cache.$thumbs.querySelector(`.${thumb_active_class}`)
                            if (!am.sw_main) return
                            $activeThumb.classList.remove(thumb_active_class)
                            am.cache.$thumbs.querySelector(`.swiper-slide[data-media-id="${mediaId}"]`).classList.add(thumb_active_class)
                        })
                    }
                }
            });
        },
        e_SlideTo(index) {
            let am = this;
            am.sw_main.slideTo(index);
        }
    }));

    Alpine.data('BundleSelection', () => ({
        bundle_option: "2",
        init() {
            let am = this;
            am.MoveTitle();
            am.MoveTabs();

            if (window.innerWidth <= 768) return;

            const MAX_SELECTION = 4;
            let observer = null;
            let updateTimer = null;
            let lastCount = -1;

            const getStickyContainer = () => document.querySelector('.status-bar-sign-up');

            const insertCleanPrice = () => {
                const container = getStickyContainer();
                if (!container) return;

                // Always hide the original price line
                const originalCopy = container.querySelector('.thl-copy');
                if (originalCopy) {
                    originalCopy.style.display = 'none';
                }

                const existing = container.querySelector('.custom-price-only');
                if (existing) return;

                const originalSpan = container.querySelector('.thl-copy span');
                const stickyCol = container.querySelector('.tlh-title')?.parentElement;
                if (!originalSpan || !stickyCol) return;

                const cleanClone = originalSpan.cloneNode(true);
                cleanClone.classList.add('custom-price-only');
                cleanClone.style.fontSize = '14px';
                cleanClone.style.marginTop = '2px';

                stickyCol.appendChild(cleanClone);
            };



            const updateStickyTitle = () => {
                requestAnimationFrame(() => {
                    const container = getStickyContainer();
                    if (!container) return;

                    const stickyTitle = container.querySelector('.tlh-title');
                    const selectedText = container.querySelector('.thl-copy');
                    if (!stickyTitle || !selectedText) return;

                    const match = selectedText.textContent.match(/(\d+)\s*selected/i);
                    const count = match ? parseInt(match[1], 10) : 0;

                    if (count === 0) {
                        stickyTitle.textContent = `Choose ${MAX_SELECTION} Boxes`;
                    } else if (count < MAX_SELECTION) {
                        stickyTitle.textContent = `${count}/${MAX_SELECTION} Selected (continue to ${MAX_SELECTION}/${MAX_SELECTION})`;
                    } else {
                        stickyTitle.textContent = `${MAX_SELECTION}/${MAX_SELECTION} Selected`;
                    }

                    insertCleanPrice();
                });
            };

            const safeUpdateStickyTitle = () => {
                clearTimeout(updateTimer);
                updateTimer = setTimeout(() => updateStickyTitle(), 100);
            };

            const startObserver = () => {
                const container = getStickyContainer();
                if (!container) return;

                if (observer) observer.disconnect();

                observer = new MutationObserver(safeUpdateStickyTitle);
                observer.observe(container, {
                    childList: true,
                    subtree: true,
                });
            };

            const monitorSelectionCount = () => {
                const container = getStickyContainer();
                if (!container) return;

                setInterval(() => {
                    const selectedText = container.querySelector('.thl-copy');
                    if (!selectedText) return;

                    const match = selectedText.textContent.match(/(\d+)\s*selected/i);
                    const count = match ? parseInt(match[1], 10) : 0;

                    if (count !== lastCount) {
                        lastCount = count;
                        updateStickyTitle();
                    }
                }, 300);
            };

            // Delay setup to wait for Recharge bundle to render
            setTimeout(() => {
                updateStickyTitle();
                startObserver();
                monitorSelectionCount();
            }, 3000);

            // OPTIONAL: re-run logic if Add button is clicked and bundle re-renders
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-element="add-button"]')) {
                    setTimeout(() => {
                        updateStickyTitle();
                        startObserver();
                    }, 1500);
                }
            });
        },

        MoveTitle() {
            let $sc_bundle_app = document.querySelector('.sc--app');
            let $title = document.querySelector('.sc-title').closest('.section-heading');
            $sc_bundle_app.querySelector('#recharge-bundles').insertAdjacentElement('afterbegin', $title);
        },
        MoveTabs() {
            let am = this;
            let $tabs = document.querySelector('.product-detail__tab-container');
            am.$el.insertAdjacentElement('beforeend', $tabs);
        },
        e_PickFlavors(e) {
            let am = this;
            let $featured_product = $('.template-product .section-featured-product');
            let $bundles = $('.template-product #recharge-bundles');
            $featured_product.hide();
            $bundles.hide();

            if (am.bundle_option == "1") {
                $featured_product.show();
                let pos_top = $featured_product.offset().top - document.documentElement.style.getPropertyValue('--nav-height').replace('px', '')
                window.scrollTo({
                    top: pos_top,
                    behavior: 'smooth'
                });
            }

            if (am.bundle_option == "2") {
    //             $bundles.show();
    //             if ($bundles.find('.price-container').length === 0) {
    //                 $bundles.prepend(`
    //      <style>
    //       @media (max-width: 768px) {
    //         .mobile-translate {
    //           transform: translateY(70px) !important;
    //         }
    //       }
    //       @media (max-width: 320px) {
    //         .mobile-translate {
    //           transform: translateY(125px) !important;
    //         }
    //       }
    //       @media (max-width: 375px) {
    //         .mobile-translate {
    //           transform: translateY(115px) !important;
    //         }
    //         .hello-heading {
    //         font-size: 16px;
    //         }
    //       }
    //     </style>
    //   <div class="price-container mobile-translate" style="width: 100%; display: flex; justify-content: space-between;   font-family: Libre Baskerville; transform: translateY(80px)">
    //     <h3 class="hello-heading" style="color: #211f20">Pick 4 boxes (1 per week) </h3>
    //     <h3 class="hello-heading" style="color: #211f20; font-weight: 700;">$28 per box</h3>
    //   </div>
    // `);
    //             }
    //             let pos_top = $bundles.offset().top - document.documentElement.style.getPropertyValue('--nav-height').replace('px', '')
    //             window.scrollTo({
    //                 top: pos_top,
    //                 behavior: 'smooth'
    //             });
                window.location.href = "/pages/pick-monthly-flavors";

            }
            if (am.bundle_option == "3") {
                // redirect
                let monthly_prod_url = e.currentTarget.dataset.monthly_product_url;
                window.location.href = monthly_prod_url;
            }
        }
    }));
});

// TODO - 
// Product bundle icons to be changed from metafields.
function colorStarPaths() {
  // حالت ۱: انتخاب معمولی
  let starPaths = document.querySelectorAll('.star-container path');
  
  // حالت ۲: اگر SVG از طریق use/symbol لود شده
  if (starPaths.length === 0) {
    starPaths = document.querySelectorAll('.star-container svg path');
  }

  // حالت ۳: اگر fill در CSS قفل شده
  starPaths.forEach(path => {
    path.style.setProperty('fill', 'black', 'important');
    path.setAttribute('fill', 'black'); // برای اطمینان دوگانه
    path.setAttribute('stroke', 'black'); // برای اطمینان دوگانه
  });

  // اگر بازهم المان یافت نشد، خطا چاپ کنید
  if (starPaths.length === 0) {
    console.error('هیچ المان path با کلاس star-container یافت نشد!');
  } else {
    console.log(`تعداد ${starPaths.length} path قرمز شدند.`);
  }
}

// اجرا پس از لود DOM
document.addEventListener('DOMContentLoaded', colorStarPaths);

// اگر SVG دینامیک اضافه میشود:
new MutationObserver(colorStarPaths).observe(document.body, {
  childList: true,
  subtree: true
});


