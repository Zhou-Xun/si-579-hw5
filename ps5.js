/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

savedWords.textContent = "(none)";

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 *
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            wordOutput.innerHTML = "";
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    // You'll need to finish this...
    savedWordsArray.push(word.trim())
    savedWords.textContent = savedWordsArray.join(",");
}

// Add additional functions/callbacks here.

const removeChild = (parent) => {
    parent.innerHTML = "";
}

const rhyming = e => {
    removeChild(outputDescription)
    removeChild(wordOutput)

    const query = wordInput.value;
    outputDescription.textContent = `Words that rhyme with ${query}:`;
    // get data
    wordOutput.innerHTML += "<p>...loading</p>"
    let url = getDatamuseRhymeUrl(query);
    datamuseRequest(url, data => {
        if (data.length === 0) {
            wordOutput.innerHTML += "<ul><li>(no results)</li></ul>"
        } else {
            const mapped_data = groupBy(data, "numSyllables")
            for (let group in mapped_data) {
                wordOutput.innerHTML += `<h3>${group} syllable:</h3>`;
                const group_lyst = document.createElement("ul");
                for (let word_entry in mapped_data[group]) {
                    const {word} = mapped_data[group][word_entry];
                    group_lyst.innerHTML += `<li>${word} &nbsp <button class="saved_button" onclick="saveClick(this)" style="color: white; background-color: green">(Save)</button></li>`;
                }
                wordOutput.append(group_lyst);
            }
        }
    })
}


// Add event listeners here.
showRhymesButton.addEventListener('click', rhyming )
wordInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        rhyming(e);
    }
})

showSynonymsButton.addEventListener('click', e => {
    removeChild(outputDescription)
    removeChild(wordOutput)

    const query = wordInput.value;
    outputDescription.textContent = `Words with a similar meaning to ${query}:`;
    // loading
    wordOutput.innerHTML += "<p>...loading</p>"
    let url = getDatamuseSimilarToUrl(query);
    datamuseRequest(url, data => {
        if (data.length === 0) {
            wordOutput.innerHTML += "<ul><li>(no results)</li></ul>"
        } else {
            const group_lyst = document.createElement("ul");
            wordOutput.append(group_lyst)
            for (let item in data) {
                const {word} = data[item];
                group_lyst.innerHTML += `<li>${word} &nbsp <button class="saved_button" onclick="saveClick(this)" style="color: white; background-color: green">(Save)</button></li>`;
            }
        }

    })
})

// wordOutput.addEventListener('click', e => {
//     if (e.target.classList.contains("saved_button")) {
//         addToSavedWords(e.target.previousSibling.textContent);
//     }
// })

const saveClick = (el) => {
    addToSavedWords(el.previousSibling.textContent);
}