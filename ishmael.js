class Ishmael {

  constructor(elementId) {
    this.node = document.getElementById(elementId);
    this.noiseIndexes = [];

    this.options = {
      delay: 1000,
      fps: 40,
      charset: 'qwertyuiopasdfghjklzxcvbnm_____________________',
      repeat: true,
      fromEmpty: true,
      flicker: true
    }
  }

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
      if ((flippedIndexes.includes(noiseIndex) && Math.floor(Math.random() * iterations) == 0 && this.options.flicker)
          || !flippedIndexes.includes(noiseIndex)) {
        const randomChar = Ishmael._randomChar(charset);
        adjustedStr1 = `${Ishmael._setCharAt(adjustedStr1, noiseIndex, randomChar)}`;
        this.noiseIndexes.push(noiseIndex);
        if (flippedIndexes.includes(noiseIndex)) {
          flippedIndexes = flippedIndexes.filter(i => i !== noiseIndex);
        }
      }

      const flipIndex = Ishmael._getFlipIndex(flippedIndexes, adjustedStr1.length);
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

  static _getFlipIndex(flippedIndexes, len) {
    const zeroToLen = Array.apply(null, {length: len}).map(Number.call, Number);
    const unflippedIndexes = Ishmael._diff(flippedIndexes, zeroToLen);
    const flipIndex = unflippedIndexes[Math.floor(Math.random() * unflippedIndexes.length)];
    return flipIndex;
  }

  static _diff(a, b) {
    return b.filter((i) => a.indexOf(i) < 0);
  };

  static _setCharAt(str, index, chr) {
    if (index > str.length - 1 ) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
  }

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

  static _removeOne(str) {
    const prefix = (Math.round(Math.random()) === 1) ? true : false;

    return (prefix) ? str.slice(1, -1) : str.slice(0, -1);
  }

  static _randomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

}
