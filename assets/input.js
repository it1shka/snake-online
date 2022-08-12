const KeyMap = Object.freeze({
    'w': 0 /* Up */,
    'arrowup': 0 /* Up */,
    'd': 1 /* Right */,
    'arrowright': 1 /* Right */,
    's': 2 /* Down */,
    'arrowdown': 2 /* Down */,
    'a': 3 /* Left */,
    'arrowleft': 3 /* Left */,
});
export const Opposite = Object.freeze({
    [0 /* Up */]: 2 /* Down */,
    [1 /* Right */]: 3 /* Left */,
    [2 /* Down */]: 0 /* Up */,
    [3 /* Left */]: 1 /* Right */,
});
export const subscribeToInput = (element, update) => {
    const listener = (event) => {
        const key = event.key.toLowerCase();
        if (!(key in KeyMap))
            return;
        const direction = KeyMap[key];
        update(direction);
    };
    element.addEventListener('keydown', listener);
    return () => {
        element.removeEventListener('keydown', listener);
    };
};
