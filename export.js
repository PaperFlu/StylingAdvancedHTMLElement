const css = String.raw;

class Style {
  status = 'unloaded'; // unloaded, loading, complete.
  url = '';
  text = '';
  applyQueue = [];

  constructor(url) {
    this.url = url;

    this.update();
  }

  async update() {
    if (this.status === 'loading') return;
    this.status = 'loading';

    await fetch(this.url).then(r => r.text()).then((text) => {
      this.text = text;
      this.status = 'complete';

      for (const ele of this.applyQueue) {
        ele.styleEle.textContent = text;
      };
    }).catch((error) => {
      this.status = 'unloaded';
      throw error;
    });
  }
};

class StylingAdvancedHTMLElement extends HTMLElement {
  static styleFileUrl;

  static initialStyleText = css`
    :host {
      position: absolute !important;
      visibility: hidden !important;
    }
  `;

  static styleList = [];

  styleEle = document.createElement('style');

  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open',
    });

    const {
      styleFileUrl,
      initialStyleText,
      styleList,
    } = this.constructor;

    let style = styleList.find(style => styleFileUrl === style.url);
    if (!style) {
      style = new Style(styleFileUrl);
      styleList.push(style);
    };

    let styleText;
    if (style.status !== 'complete') {
      styleText = initialStyleText;
      style.applyQueue.push(this);
    } else {
      styleText = style.text;
    };

    this.styleEle.textContent = styleText;
    shadow.prepend(this.styleEle);
  }
};

export { StylingAdvancedHTMLElement };
