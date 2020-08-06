# Dynamical Custom Element Without FOUC

It has long been a problem that you have to either write css **inside** js code or import them from external file and bear a [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) (flash of unstyled content) when **dynamically creating custom elements**.

> **PS:** I found the issue by googling it for 10 minutes, so don't expect me to be responsible for the authenticity of the 'either...or...' sentence.

but there is a way.

## Idea

The idea to the problem is almost the same as to solve FOUC of other kinds by operating related element: **hide before done**.

### 1. Write a defalut style for the unstyled element.

The prefered CSS is like:

```css
:host {
  position: absolute;
  visibility: hidden;
}
```

- `absolute` makes the element removed from the normal document flow, so that it won't occupy the space it should not.
- Hide the element before style is loaded.

**? Q** Why you would like to remove my element from the normal document flow?

**! A** Not liking FOUC of some kinds, which affects the whole page, the FOUC of custom elements only affects the element **itself**. So the solution to them has a little difference, too. Normal FOUC may be solved by hide the whole page before CSS is ready, while custom-element-FOUC **should not** do a such thing. In this case, keep the element in the normal flow may **occupy the wrong place**, causing **twice** "FOOC" (flash of other content). (Remember we are dynamically adding elements.)

**? Q** Why don't you use `display: none` directly? It's pretty clean.

**! A** Simply set `display` to `none` will surely remove the element from the normal document flow and hide the whole thing, but browsers today [may not load contents of it and its descendants as well](https://stackoverflow.com/questions/12158540/does-displaynone-prevent-an-image-from-loading), which means images might **not be ready** for the next step, appearing. So I suggest the combination of `visibility` and `position`.

### 2. Apply the style when ready.

Now it's done. Looks simple, like many answers on Stack Overflow before, right? So, it's just adapting a **Custom Element** version:

## Usage

Copy the *sample code* below or download `export.js`.

```javascript
const getUrl = (name) => {
  return `./css/${name}`;
};

class StylingAdvancedHTMLElement extends HTMLElement {
  static initialStyle = `
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
    const fileUrl = getUrl(this.constructor.styleFileName);
    const styleText = await fetch(fileUrl).then((response) => response.text());
    this.styleEle.innerText = styleText;
  }
};
```

> Edit the code or `export.js` to fit your need. Especially the `getUrl` function.

Open your project and paste, or import `StylingAdvancedHTMLElement` from `export.js` if you don't want my freely written code ruins yours. Then, find all the string representing class `HTMLElement`, or say which your custom element's constructor extends from, **replace** them with `StylingAdvancedHTMLElement`. It will be like:

```javascript
// Before:
class StupidToggler extends HTMLElement {
  constructor() {
    super();
  }
};
// After:
class StupidToggler extends StylingAdvancedHTMLElement {
  constructor() {
    super();
  }
};
```

Delete your previous `<link>`-(or-`<style>`)-creating code, along with `attachShadow` call. Set the name of the CSS file as a **static** property, `styleFileName`.

```javascript
// Before:
class StupidToggler extends StylingAdvancedHTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: open});

    const styleEle = document.createElement('link');
    styleEle.setAttribute('rel', 'stylesheet');
    styleEle.setAttribute('href', 'stupid-toggler.css');

    shadow.appendChild(styleEle);
  }
};
// After:
class StupidToggler extends StylingAdvancedHTMLElement {
  static styleFileName = 'stupid-toggler.css';
  constructor() {
    super();

    // Use this.shadowRoot in future code to get equal access as the `shadow` parameter.
  }
};
```

Everything is ready but your habit now.

## Troubleshooting and Suggestions

Trouble? Try openning an issue.

**? Q** I found your code can be improved!

**! A** Improve and pull request, we can discuss it!

## License

MIT Licensed
