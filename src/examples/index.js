export const EXAMPLES = {
    'Persistent sine': 'persistent-sine.js',
    'Decaying sine': 'decaying-sine.js',
    'Hi-hat': 'hihat.js',
    'Pink noise': 'pink-noise.js',
    'FM bell': 'fm-bell.js',
    'Poly saw': 'poly-saw.js',
    'Moog filter': 'moog-filter.js',
    'Band-limited square': 'band-limited-square.js',
    Gunfire: 'gunfire.js',
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
