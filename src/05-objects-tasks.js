/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;

  this.getArea = function () {
    return this.width * this.height;
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  obj.__proto__ = proto;
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class Selector {
  constructor(value, selectors, builder) {
    this.value = value;
    this.selectors = selectors?.length ? [...selectors, this] : [this];
    this.template = '{{value}}';

    /*
      This is my main problem with this task.
      I can't think of any other way
      to get methods from cssSelectorBuilder object into a class instance
      than to pass them directly to the constructor and merge it every time.
      If you know a better solution, please let me know :)
    */
    Object.assign(this, builder);
  }

  stringify() {
    return this.selectors
      .map((selector) => selector.template.replace('{{value}}', selector.value))
      .join('');
  }
}

class ElementSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
  }
}

class IdSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
    this.template = '#{{value}}';
  }
}

class ClassSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
    this.template = '.{{value}}';
  }
}

class AttributeSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
    this.template = '[{{value}}]';
  }
}

class PseudoClassSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
    this.template = ':{{value}}';
  }
}

class PseudoElementSelector extends Selector {
  constructor(value, prevSelectors, builder) {
    super(value, prevSelectors, builder);
    this.template = '::{{value}}';
  }
}

class CombinedSelector {
  constructor(selector1, combinator, selector2) {
    this.combinator = combinator;
    this.selector1 = selector1;
    this.selector2 = selector2;
  }

  stringify() {
    return `${this.selector1.stringify()} ${
      this.combinator
    } ${this.selector2.stringify()}`;
  }
}

const cssSelectorBuilder = {
  _checkIsAlowed(allowedPrevList) {
    const lastSelector = this.selectors?.at(-1);
    if (
      lastSelector &&
      !allowedPrevList.some((allowed) => lastSelector instanceof allowed)
    )
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element'
      );
  },

  _checkIsUnique(constructorName) {
    if (
      this.selectors &&
      this.selectors.some((selector) => selector instanceof constructorName)
    )
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );
  },

  element(value) {
    if (
      this.selectors &&
      this.selectors.some((selector) => selector instanceof ElementSelector)
    )
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );

    const allowedPrevList = [];
    const lastSelector = this.selectors?.at(-1);
    if (
      lastSelector &&
      !allowedPrevList.some((allowed) => lastSelector instanceof allowed)
    )
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element'
      );
    return new ElementSelector(value, [], this);
  },

  id(value) {
    const allowedPrevList = [ElementSelector];
    this._checkIsUnique(IdSelector);
    this._checkIsAlowed(allowedPrevList);
    return new IdSelector(value, this.selectors, cssSelectorBuilder);
  },

  class(value) {
    const allowedPrevList = [ElementSelector, IdSelector, ClassSelector];
    this._checkIsAlowed(allowedPrevList);

    return new ClassSelector(value, this.selectors, cssSelectorBuilder);
  },

  attr(value) {
    const allowedPrevList = [
      ElementSelector,
      IdSelector,
      ClassSelector,
      AttributeSelector,
    ];
    this._checkIsAlowed(allowedPrevList);
    return new AttributeSelector(value, this.selectors, cssSelectorBuilder);
  },

  pseudoClass(value) {
    const allowedPrevList = [
      ElementSelector,
      IdSelector,
      ClassSelector,
      AttributeSelector,
      PseudoClassSelector,
    ];
    this._checkIsAlowed(allowedPrevList);

    return new PseudoClassSelector(value, this.selectors, cssSelectorBuilder);
  },

  pseudoElement(value) {
    const allowedPrevList = [
      ElementSelector,
      IdSelector,
      ClassSelector,
      AttributeSelector,
      PseudoClassSelector,
      PseudoElementSelector,
    ];

    this._checkIsAlowed(allowedPrevList);
    this._checkIsUnique(PseudoElementSelector);
    return new PseudoElementSelector(value, this.selectors, cssSelectorBuilder);
  },

  combine(selector1, combinator, selector2) {
    return new CombinedSelector(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
