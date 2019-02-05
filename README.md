# ishmael

Ishmael is a text effect vanilla javascript library in progress.


## Transition

```js
// Pass the ID of the element that should be animated.
const noise = new Ishmael('noise-element');

noise.transition([
  'Call me Ishmael.',
  'Some years ago',
  'never mind how long precisely',
  'having little or no money in my purse',
  'and nothing particular to interest me on shore',
  'I thought I would sail about a little',
  'and see the watery part of the world.'
]);
```

Example: https://buroni.github.io/ishmael/

### Transition Options

| Object property | Type | Description |
| ------------- |:-------------:| -----:|
| charset | string | 'Noise' characters to be used in the transition |
| delay      | number | Milliseconds to persist each sentence before transitioning |
| direction| 'random' \| 'lr' \| 'rl' | The direction in which to transition between sentences |
| flicker | boolean | Whether to randomly flicker characters with noise in the transition |
| fps      | number     | Frames per second in the transition animation |
| fromEmpty | boolean | Whether to initiate from empty string or from the first sentence in array |
| repeat | boolean | Whether the transition should cycle forever |

### Transition Styling

Add style attributes to the CSS class `.ishmael-noise` to style the noise characters in the transition.
