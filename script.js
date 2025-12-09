document.addEventListener('DOMContentLoaded', function () {
    const availableTranslations = (typeof translations !== 'undefined') ? translations : {};
    const i18nRegistry = [];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const attr = (el.dataset.i18nAttr || '').trim();
        i18nRegistry.push({
            el,
            key,
            attr: attr || null,
            defaultValue: attr ? (el.getAttribute(attr) || '') : el.innerHTML
        });
    });

    function renderLanguage(lang) {
        const dict = availableTranslations[lang];
        const targetLang = (lang === 'es' || !dict) ? 'es' : lang;
        const translationsMap = availableTranslations[targetLang] || {};

        i18nRegistry.forEach(item => {
            const translatedValue = targetLang === 'es' ? undefined : translationsMap[item.key];
            const value = (typeof translatedValue === 'string' && translatedValue.length)
                ? translatedValue
                : item.defaultValue;
            if (item.attr) {
                item.el.setAttribute(item.attr, value);
            } else {
                item.el.innerHTML = value;
            }
        });

        document.documentElement.lang = targetLang;
        document.querySelectorAll('.lang-link').forEach(link => {
            const linkLang = link.dataset.lang || 'es';
            link.classList.toggle('active', linkLang === targetLang);
        });

        return targetLang;
    }

    function updateLanguage(lang) {
        const appliedLang = renderLanguage(lang);
        const params = new URLSearchParams(window.location.search);
        if (appliedLang === 'es') {
            params.delete('lang');
        } else {
            params.set('lang', appliedLang);
        }
        const query = params.toString();
        const hash = window.location.hash || '';
        const newUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
        window.history.replaceState(null, '', newUrl);
    }

    const initialParams = new URLSearchParams(window.location.search);
    const initialLang = initialParams.get('lang') || 'es';
    updateLanguage(initialLang);

    document.querySelectorAll('.lang-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.dataset.lang || 'es';
            updateLanguage(lang);
        });
    });

    const images = document.querySelectorAll('.gallery-img');
    const gallery = Array.from(images).map(img => img.src);
    let currentIndex = 0;

    // Create modal elements
    const modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Modal content
    const modalContent = document.createElement('div');
    modalContent.style.position = 'relative';
    modalContent.style.display = 'flex';
    modalContent.style.alignItems = 'center';
    modalContent.style.justifyContent = 'center';

    // Image element
    const modalImg = document.createElement('img');
    modalImg.style.maxWidth = '80vw';
    modalImg.style.maxHeight = '80vh';
    modalImg.style.borderRadius = '12px';
    modalImg.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';

    // Left arrow
    const leftArrow = document.createElement('span');
    leftArrow.innerHTML = '&#8592;';
    leftArrow.style.position = 'absolute';
    leftArrow.style.left = '-48px';
    leftArrow.style.top = '50%';
    leftArrow.style.transform = 'translateY(-50%)';
    leftArrow.style.fontSize = '3rem';
    leftArrow.style.color = '#fff';
    leftArrow.style.cursor = 'pointer';
    leftArrow.style.userSelect = 'none';

    // Right arrow
    const rightArrow = document.createElement('span');
    rightArrow.innerHTML = '&#8594;';
    rightArrow.style.position = 'absolute';
    rightArrow.style.right = '-48px';
    rightArrow.style.top = '50%';
    rightArrow.style.transform = 'translateY(-50%)';
    rightArrow.style.fontSize = '3rem';
    rightArrow.style.color = '#fff';
    rightArrow.style.cursor = 'pointer';
    rightArrow.style.userSelect = 'none';

    // Close button (X)
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&#10006;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-48px';
    closeBtn.style.right = '0';
    closeBtn.style.fontSize = '2.5rem';
    closeBtn.style.color = '#fff';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.userSelect = 'none';
    closeBtn.style.background = 'rgba(0,0,0,0.3)';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.padding = '6px 14px';

    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        modal.style.display = 'none';
    });

    // Close modal on background click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Arrow navigation
    leftArrow.addEventListener('click', function (e) {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        modalImg.src = gallery[currentIndex];
    });
    rightArrow.addEventListener('click', function (e) {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % gallery.length;
        modalImg.src = gallery[currentIndex];
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
                modalImg.src = gallery[currentIndex];
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % gallery.length;
                modalImg.src = gallery[currentIndex];
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
        }
    });

    // Add elements to modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(leftArrow);
    modalContent.appendChild(modalImg);
    modalContent.appendChild(rightArrow);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Open modal on image click
    images.forEach((img, idx) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function () {
            currentIndex = idx;
            modalImg.src = gallery[currentIndex];
            modal.style.display = 'flex';
        });
    });

    // Video Facade Logic
    const facades = document.querySelectorAll('.video-facade');
    facades.forEach(facade => {
        const videoId = facade.dataset.videoId;
        const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        // Try to load maxres first
        const img = new Image();
        img.src = maxResUrl;
        img.onload = function () {
            // YouTube returns a 120px wide placeholder if maxres doesn't exist
            if (this.width === 120) {
                facade.style.backgroundImage = `url('${hqUrl}')`;
            } else {
                facade.style.backgroundImage = `url('${maxResUrl}')`;
            }
        };
        img.onerror = function () {
            facade.style.backgroundImage = `url('${hqUrl}')`;
        };

        facade.addEventListener('click', function () {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            this.innerHTML = '';
            this.appendChild(iframe);
        });
    });

    // Mobile Menu Logic
    const menuBtn = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});
