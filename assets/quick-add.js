if (!customElements.get('quick-add-modal')) {
  customElements.define('quick-add-modal', class QuickAddModal extends ModalDialog {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
    }

    hide(preventFocus = false) {
      const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (cartNotification) cartNotification.setActiveElement(this.openedBy);
      this.modalContent.innerHTML = '';

      if (preventFocus) this.openedBy = null;
      super.hide();
    }

    show(opener) {
      console.log(opener);
      opener.setAttribute('aria-disabled', true);
      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          console.log(responseHTML);
          this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          console.log(this.productElement);
          this.preventDuplicatedIDs();
          this.removeDOMElements();
          this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }

          if (window.ProductModel) window.ProductModel.loadShopifyXR();

          this.removeGalleryListSemantic();
          this.updateImageSizes();
          this.preventVariantURLSwitching();
          super.show(opener);
        })
        .finally(() => {
          opener.removeAttribute('aria-disabled');
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    setInnerHTML(element, html) {
      element.innerHTML = html;

      // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      element.querySelectorAll('script').forEach(oldScriptTag => {
        const newScriptTag = document.createElement('script');
        Array.from(oldScriptTag.attributes).forEach(attribute => {
          newScriptTag.setAttribute(attribute.name, attribute.value)
        });
        newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
        oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      });
    }

    preventVariantURLSwitching() {
      this.modalContent.querySelector('variant-radios,variant-selects').setAttribute('data-update-url', 'false');
    }

    removeDOMElements() {
      const pickupAvailability = this.productElement.querySelector('pickup-availability');
      if (pickupAvailability) pickupAvailability.remove();

      const productModal = this.productElement.querySelector('product-modal');
      if (productModal) productModal.remove();
    }

    preventDuplicatedIDs() {
      const sectionId = this.productElement.dataset.section;
      this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${ sectionId }`);
      this.productElement.querySelectorAll('variant-selects, variant-radios').forEach((variantSelect) => {
        variantSelect.dataset.originalSection = sectionId;
      });
    }

    removeGalleryListSemantic() {
      const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
      if (!galleryList) return;

      galleryList.setAttribute('role', 'presentation');
      galleryList.querySelectorAll('[id^="Slide-"]').forEach(li => li.setAttribute('role', 'presentation'));
    }

    updateImageSizes() {
      const product = this.modalContent.querySelector('.product');
      const desktopColumns = product.classList.contains('product--columns');
      if (!desktopColumns) return;

      const mediaImages = product.querySelectorAll('.product__media img');
      if (!mediaImages.length) return;

      let mediaImageSizes = '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';
      
      if (product.classList.contains('product--medium')) {
        mediaImageSizes = mediaImageSizes.replace('715px', '605px');
      } else if (product.classList.contains('product--small')) {
        mediaImageSizes = mediaImageSizes.replace('715px', '495px');
      }

      mediaImages.forEach(img => img.setAttribute('sizes', mediaImageSizes));
    }
  });
}

























// here for reference because it's using methods from this custom element

// class ModalDialog extends HTMLElement {
//   constructor() {
//     super();
//     this.querySelector('[id^="ModalClose-"]').addEventListener(
//       'click',
//       this.hide.bind(this, false)
//     );
//     this.addEventListener('keyup', (event) => {
//       if (event.code.toUpperCase() === 'ESCAPE') this.hide();
//     });
//     if (this.classList.contains('media-modal')) {
//       this.addEventListener('pointerup', (event) => {
//         if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
//       });
//     } else {
//       this.addEventListener('click', (event) => {
//         if (event.target === this) this.hide();
//       });
//     }
//   }

//   connectedCallback() {
//     if (this.moved) return;
//     this.moved = true;
//     document.body.appendChild(this);
//   }

//   show(opener) {
//     this.openedBy = opener;
//     const popup = this.querySelector('.template-popup');
//     document.body.classList.add('overflow-hidden');
//     this.setAttribute('open', '');
//     if (popup) popup.loadContent();
//     trapFocus(this, this.querySelector('[role="dialog"]'));
//     window.pauseAllMedia();
//   }

//   hide() {
//     document.body.classList.remove('overflow-hidden');
//     document.body.dispatchEvent(new CustomEvent('modalClosed'));
//     this.removeAttribute('open');
//     removeTrapFocus(this.openedBy);
//     window.pauseAllMedia();
//   }
// }
// customElements.define('modal-dialog', ModalDialog);

// 