class CustomUpsellProduct extends HTMLElement {
  constructor() {
    super();
    this.cartAddUrl = `{{ routes.cart_add_url }}.js`;
    this.cartUpdateUrl = `{{ routes.cart_update_url }}.js`;
    this.min = {{ min }};
    this.max = parseInt(this.getAttribute('data-max')) || {{ default_max }};
    this.id = this.getAttribute('data-id');
    this.quantityInput = this.querySelector('input[data-quantity]');
    this.decreaseButton = this.querySelector('button[data-decrease]');
    this.increaseButton = this.querySelector('button[data-increase]');
    this.decreaseButton.addEventListener('click', () => this.quantity--);
    this.increaseButton.addEventListener('click', () => this.quantity++);
  }
  get quantity() {
    return this.quantityInput.value;
  }
  set quantity(value) {

    this.enableLoading();
    this.updateCart(value)
    .then(cart => this.quantityInput.value = this.getCartQuantity(cart))
    .catch(err => console.error(err))
    .finally(() => this.disableLoading());
  }
  enableLoading() {
    this.classList.add('loading');
    this.decreaseButton.disabled = true;
    this.increaseButton.disabled = true;
  }
  disableLoading() {
    this.classList.remove('loading');
    this.decreaseButton.disabled = this.quantity <= this.min;
    this.increaseButton.disabled = this.quantity >= this.max;
  }
  async updateCart(quantity) {
    return (this.quantity > 0)
      ? await this.postJson(this.cartUpdateUrl, { updates: { [this.id]: quantity } })
      : await this.postJson(this.cartAddUrl, { items: [{ id: this.id, quantity }] });
  }
  async postJson(url, data = {}) {
    const res = await fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
  getCartQuantity(cart) {
    return cart?.items?.find(i => i.variant_id == this.id)?.quantity || 0;
  }
}
customElements.define('custom-upsell-product', CustomUpsellProduct);