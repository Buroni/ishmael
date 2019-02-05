class Ishmael {

  constructor(elementId) {
    this.node = document.getElementById(elementId);
    this.noiseIndexes = [];

    this.options = {
      delay: 1000,
      fps: 40,
      charset: 'abcdefghijklmnopqrstuvwxyz_______________',
      repeat: true,
      fromEmpty: true,
      flicker: true,
      direction: 'random'
    }
  }

  /**
   * Perform a Ishmael effect on an array of sentences.
   *
   * @param sentences
   * @param options
   * @param firstIteration
   */
  transition(sentences, options = this.options, firstIteration = true) {
    const funcs = [];
    const baseIndex = (this.options.fromEmpty || !firstIteration) ? 0 : 1;

    this.options = {...this.options, ...options};

    for (let i = baseIndex; i < sentences.length - 1; i ++) {
      funcs.push(() => this._transitionPair(sentences[i], sentences[i + 1]));
    }

    if (this.options.repeat) {
      funcs.push(() => this.transition(sentences, {...options, fromEmpty: false}, false));
    }

    let basePromise;
    if (!firstIteration) {
      basePromise = () => this._transitionPair(sentences[sentences.length - 1], sentences[0]);
    } else if (this.options.fromEmpty) {
      basePromise = () => this._transitionPair('', sentences[0]);
    } else {
      basePromise = () => this._transitionPair(sentences[0], sentences[1]);
    }

    funcs.reduce((prev, cur) => prev.then(cur), basePromise());
  }


  /**
   * Given two sentences, Ishmael from one to the other recursively.
   *
   * @param str1
   * @param str2
   * @param flippedIndexes
   * @param iterations
   * @returns {*}
   * @private
   */
  _transitionPair(str1, str2, flippedIndexes = [], iterations = 0) {
    this.node.innerHTML = this._style(str1);

    if (str1 === str2) {
      return str1;
    }

    if (iterations === 0) {
      this.noiseIndexes = [];
    }

    const delay = (iterations === 0) ? this.options.delay : 1000 / this.options.fps;
    const charset = this.options.charset;
    let adjustedStr1 = str1;
    let adjustedStr2 = str2;

    // On the first iteration if strings aren't equal length, pad the
    // smaller one with random characters or trim down the larger one.
    if (str1.length < str2.length) {
      adjustedStr1 = this._padOne(str1, charset);
    }
    else if (str1.length > str2.length) {
      adjustedStr1 = Ishmael._removeOne(str1);
    }
    else {
      const noiseIndex = Math.floor(Math.random() * adjustedStr1.length);

      if (this._addNoise(flippedIndexes, noiseIndex, iterations)) {
        const randomChar = Ishmael._randomChar(charset);
        adjustedStr1 = `${Ishmael._setCharAt(adjustedStr1, noiseIndex, randomChar)}`;
        this.noiseIndexes.push(noiseIndex);

        if (flippedIndexes.includes(noiseIndex)) {
          flippedIndexes = flippedIndexes.filter(i => i !== noiseIndex);
        }
      }

      const flipIndex = this._getFlipIndex(flippedIndexes, adjustedStr1.length);
      flippedIndexes.push(flipIndex);

      adjustedStr1 = Ishmael._setCharAt(adjustedStr1, flipIndex, adjustedStr2.charAt(flipIndex));
    }

    this.noiseIndexes = [...new Set(this.noiseIndexes.filter(i => !flippedIndexes.includes(i)))];

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          resolve(this._transitionPair(adjustedStr1, adjustedStr2, flippedIndexes, iterations + 1));
        });
      }, delay);
    });
  }

  /**
   * Add relevant HTML tags to string so that different types of
   * characters can be styled in the CSS.
   * 
   * @param str
   * @returns {*}
   * @private
   */
  _style(str) {
    if (this.noiseIndexes.length === 0) return str;
    this.noiseIndexes = this.noiseIndexes.sort((a, b) => a - b);
    const newStrs = [];

    newStrs.push(str.slice(0, this.noiseIndexes[0]));

    for (let i = 0; i < this.noiseIndexes.length; i++) {
      const chr = str.slice(this.noiseIndexes[i], this.noiseIndexes[i] + 1);
      newStrs.push(`<span class='ishmael-noise'>${chr}</span>${str.slice(this.noiseIndexes[i] + 2, this.noiseIndexes[i + 1])}`);
    }
    return newStrs.join('');
  }

  /**
   * Determine whether to add a noise character to the string, where the probability
   * of adding noise tends to 0 as iterations increase.
   * 
   * @param flippedIndexes
   * @param noiseIndex
   * @param iterations
   * @returns {boolean}
   * @private
   */
  _addNoise(flippedIndexes, noiseIndex, iterations) {
    return (flippedIndexes.includes(noiseIndex) &&
        Math.floor(Math.random() * iterations) == 0 && this.options.flicker)
        || !flippedIndexes.includes(noiseIndex);
  }

  /**
   * Add a random character to the start or end of a string.
   * 
   * @param str
   * @param charset
   * @returns {string}
   * @private
   */
  _padOne(str, charset) {
    const prefix = (Math.round(Math.random()) === 1) ? true : false;
    const char = Ishmael._randomChar(charset);

    if (prefix) {
      this.noiseIndexes = this.noiseIndexes.map(i => i + 1);
      this.noiseIndexes.push(0);
    } else {
      this.noiseIndexes.push(str.length);
    }

    return (prefix) ? `${char}${str}` : `${str}${char}`;
  }

  /**
   * Remove a ranom character from the start or end of a string.
   * 
   * @param str
   * @returns {Array.<T>|string|Blob|ArrayBuffer}
   * @private
   */
  static _removeOne(str) {
    const prefix = (Math.round(Math.random()) === 1) ? true : false;

    return (prefix) ? str.slice(1, -1) : str.slice(0, -1);
  }

  /**
   * Choose which index to flip, by randomly choosing
   * an index which hasn't been flipped yet. A flipped
   * index is one where the letter at that index is correct for
   * the sentence we're currently Ishmaeling to.
   * 
   * @param flippedIndexes
   * @param len
   * @returns {*}
   * @private
   */
  _getFlipIndex(flippedIndexes, len) {
    const zeroToLen = Array.apply(null, {length: len}).map(Number.call, Number);
    const unflippedIndexes = Ishmael._diff(flippedIndexes, zeroToLen);

    let flipIndex;
    switch (this.options.direction) {
      case 'random':
        flipIndex = unflippedIndexes[Math.floor(Math.random() * unflippedIndexes.length)];
        break;
      case 'lr':
        flipIndex = unflippedIndexes[0];
        break;
      case 'rl':
        flipIndex = unflippedIndexes[unflippedIndexes.length - 1];
        break;
      default:
        throw new Error('options.direction must be one of "random", "lr" or "rl".');
        break;
    }

    return flipIndex;
  }

  static _diff(a, b) {
    return b.filter((i) => a.indexOf(i) < 0);
  };

  static _setCharAt(str, index, chr) {
    if (index > str.length - 1 ) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
  }

  static _randomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

}
