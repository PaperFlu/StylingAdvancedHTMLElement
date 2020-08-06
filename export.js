const getUrl = (type, name) => {
  let relativePath;
  switch (type) {
    case 'style':
      relativePath = `styles/${name}`;
      break;
    default:
      throw `No file type matched for '${type}'`;
      break;
  };
  return chrome.runtime.getURL(relativePath);
};

const css = String.raw;

class StylingAdvancedHTMLElement extends HTMLElement {
  static initialStyle = css`
    :host {
      position: absolute !important;
      visibility: hidden !important;
    }
  `;

  styleEle = document.createElement('style');

  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open',
    });

    this.styleEle.innerText = this.constructor.initialStyle;
    this.shadowRoot.prepend(this.styleEle);

    this.styling();
  }

  async styling() {
    const fileUrl = getUrl('style', this.constructor.styleFileName);
    const styleText = await fetch(fileUrl).then((response) => response.text());
    this.styleEle.innerText = styleText;
  }
};

export { StylingAdvancedHTMLElement };
