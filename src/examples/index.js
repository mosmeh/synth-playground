export const EXAMPLES = {
    'Persistent sine': 'persistent-sine.js',
    'Decaying sine': 'decaying-sine.js',
    'Hi-hat': 'hihat.js',
    'Complex hi-hat': 'complex-hihat.js',
    'Poly saw': 'poly-saw.js',
    'FM bell': 'fm-bell.js',
    'Karplus-Strong string': 'karplus-strong-string.js',
    'Band-limited square': 'band-limited-square.js',
    'Pink noise': 'pink-noise.js',
    Gunfire: 'gunfire.js',
    'Moog filter': 'moog-filter.js',
};

export async function getExample(name) {
    return await xhr('examples/' + EXAMPLES[name]);
}

function xhr(url) {
    let req = null;
    return new Promise(
        (resolve, reject) => {
            req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req._canceled) {
                    return;
                }
                if (req.readyState === 4) {
                    if (
                        (req.status >= 200 && req.status < 300) ||
                        req.status === 1223
                    ) {
                        resolve(req.responseText);
                    } else {
                        reject(new Error(req));
                    }
                    req.onreadystatechange = () => {};
                }
            };
            req.open('GET', url, true);
            req.responseType = '';
            req.send(null);
        },
        () => {
            req._canceled = true;
            req.abort();
        }
    );
}
