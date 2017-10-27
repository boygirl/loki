const fs = require('fs-extra');
const looksSame = require('looks-same');

function getImageDiff(path1, path2, diffPath, tolerance) {
  return new Promise(async (resolve, reject) => {
    const [reference, current] = (await Promise.all([
      fs.readFile(path1),
      fs.readFile(path2),
    ])).map(Buffer.from);

    if (current.equals(reference)) {
      return resolve(true);
    }
    if (reference.length === 0) {
      return reject(new Error('Reference image is empty'));
    }
    if (current.length === 0) {
      return reject(new Error('Current image is empty'));
    }

    return looksSame(reference, current, { tolerance }, (err, isSame) => {
      if (err) {
        reject(err);
      } else if (isSame) {
        resolve(isSame);
      } else {
        looksSame.createDiff(
          {
            reference,
            current,
            diff: diffPath,
            tolerance,
            highlightColor: '#ff00ff',
          },
          diffErr => {
            if (diffErr) {
              reject(diffErr);
            }
            resolve(false);
          }
        );
      }
    });
  });
}

module.exports = getImageDiff;
