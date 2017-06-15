import client from './persistentDataHelper'
import LineByLineReader from 'line-by-line'
import path from 'path'

// -- -- -- -- -- -- -- -- -- -- -- --
// Dictionary / Words storage options & update!
// -- -- -- -- -- -- -- -- -- -- -- --

export function storageNeedSync() {
    return new Promise(resolve => client.zcount(`words`, 0, Infinity, (err, res) => {
        if (err === null) {
            //return true if there are no elements there!
            resolve(res < 1);
        }
    }));
}

export async function updateWordsStorage() {
    //wipe that redis key!
    console.log('wiping..1');
    await wipeWords();
    console.log('LineByLineReader');
    const lr = new LineByLineReader(path.resolve('./google-10000-english-no-swears.txt'));

    lr.on('error', function (err) {
        console.log(err);
        throw new Error('Unable to read words list', err);
    });

    let buffer = [];
    //let's index them by line length - we could implement 'levels of difficulty' doing so later on
    lr.on('line', async function(line) {
        if (line.length > 7) {
            //push the 'score' and the value in said order.
            buffer.push(line.length, line);
        }

        //Let's do a batch insert
        //and don't stress out redis. Poor redis.
        if (buffer.length > 100) {
            lr.pause();
            await updateBatchWords(buffer);
            lr.resume();
            buffer = [];
        }
    });

    lr.on('end', () => {
        // All lines are read, file is closed now.
        if (buffer.length) {
            updateBatchWords(buffer);
            buffer = [];
        }
    });
}

function updateBatchWords(list) {
    return new Promise((resolve, reject) => client.zadd(`words`, list, (err, object) => {
        if (err === null) {
            resolve(object);
        } else {
            reject(err);
        }
    }));
}

function wipeWords() {
    return new Promise((resolve, reject) => client.del(`words`, (err, object) => {
        if (err === null) {
            resolve(object);
        } else {
            reject(err);
        }
    }));
}

export default {};