document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lightbox_bg = document.getElementById('lightbox-bg');
  const close = document.getElementById('close');
  const popupOriginalDiv = document.querySelector('.popup-original');
  const imgElement = popupOriginalDiv.querySelector('img');
  const photographer_name = document.getElementById('photographer-name');
  const cc = document.querySelector('.caption-text');
  const downloadButtons = lightbox.querySelectorAll('.dw-btn');
  const loader = document.getElementById('loader');
  let isLoading = false;

  async function fetchData() {
    isLoading = true; // Set isLoading to true when starting to fetch data
    try {
      const response = await axios.get('/more-data');
      const newData = response.data.photos;

      // Generate HTML for the new photos
      newData.forEach(photo => {
        const li = document.createElement('li');
        li.className = 'photo-item';

        li.innerHTML = `
          <img class="photo" src="${photo.src.portrait}" alt="${photo.alt}"
          data-original="${photo.src.original}"
          data-landscape="${photo.src.landscape}"
          data-large="${photo.src.large}"
          data-caption="${photo.alt}"
          data-photographer="${photo.photographer}"
          data-id="${photo.id}"
          data-photographer_url="${photo.photographer_url}">
          <span class="photographer">
              <a href="${photo.photographer_url}">${photo.photographer}</a>
          </span>
          <a href="/download/${photo.id}" class="download-icon">
              <img src="/images/download.png" alt="download" height="20">
              <span>Download</span>
          </a>
          <a href="/download/${photo.id}" class="download-icon-sm">
              <img src="/images/download.png" alt="download" height="20">
          </a>
        `;

        gallery.appendChild(li);
      });

      // Re-attach event listeners to the new images and download buttons
      attachImageClickListeners();
      attachDownloadClickListeners();

      // Ensure the loader is visible and re-attach the observer
      loader.style.display = 'block';
      observer.observe(loader);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      isLoading = false; // Reset isLoading to false when fetching is complete
    }
  }

  function attachImageClickListeners() {
    const images = document.querySelectorAll('.photo-item img');
    images.forEach(image => {
      image.addEventListener('click', (event) => {
        lightbox.classList.remove('hidden');
        lightbox_bg.classList.remove('hidden');

        let originalSrc = event.target.getAttribute('data-original');
        let photographer = event.target.getAttribute("data-photographer");
        let photo_alt = event.target.getAttribute("data-caption");
        let photoId = event.target.getAttribute('data-id');

        imgElement.setAttribute('src', originalSrc);
        photographer_name.textContent = photographer;
        cc.textContent = photo_alt;

        downloadButtons.forEach(button => {
          const size = button.getAttribute('data-size');
          button.href = `/download/${photoId}?size=${size}`;
        });
      });
    });
  }

  function attachDownloadClickListeners() {
    const downloadIcons = document.querySelectorAll('.download-icon, .download-icon-sm');
    downloadIcons.forEach(icon => {
      icon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the event from propagating to parent elements
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      console.log("loading...");
      fetchData();
    }
  });

  observer.observe(loader);

  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox_bg.classList.add('hidden');
  };

  lightbox_bg.addEventListener('click', (event) => {
    if (event.target === lightbox_bg || event.target === close) {
      closeLightbox();
    }
  });

  close.addEventListener('click', closeLightbox);

  // Initial call to attach event listeners
  attachImageClickListeners();
  attachDownloadClickListeners();
});

const scrollToTopButton = document.getElementById('scroll-to-top');

scrollToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }
}
