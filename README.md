# jshmm

JSHMM(very tiny HMM in JavaScript)

This program is a very tiny HMM program in pure JavaScript.
Any other library is not required.


## Usage

### 1. create a HMM object

```js
var hmm = new HMM(); 
```

On the Node.js environment, you can create an object in the following manner;
```js
var hmm = require("./jshmm.js").createHMM();
```

### 2. Prepare training data

Training data is a set of sequences. \
Sequences are separated by an empty line.

Each sequence is a set of text lines.

Each line has two tokens `observation` and `label`. Tokens are separated by one or more white spaces.

#### Example
Following is a set of morphemes for two text "I am a programmer." and "You are a programmer." 

```js
var trainingStr = [[
    "I noun",
    "am verb",
    "a article",
    "programmer noun",
    ". mark"
    ].join("\n"),
    [
    "you noun",
    "are verb",
    "a article",
    "programmer noun",
    ". mark"
    ].join("\n")
].join("\n\n")

```


### 3. Set training data and training

Training is automatically run when the method `setTrainingData()` is invoked.

```js
hmm.setTrainingData(trainingStr); 
```

### 4. Predict

`predictLabels()` predicts labels from input observations.

`predictLabels()` returns an two-dimentional array; `predResult[i][j]` is the predicted label of the j-th observation in the i-th input sequence.

Input should be a text line. \
Input may have two or more sequences separated by a empty line. \
Each sequence is a set of observations.

**NOTE: Add empty line after final input sequence.**


```js
var testStr = [
    "I",
    "have",
    "a",
    "dream",
    ".",
    "",
    "you",
    "are",
    "a",
    "nurse",
    ".",
    ""
].join("\n")

var predResult = hmm.predictLabels(testStr);

//predResult == [
//  [ 'noun', 'verb', 'article', 'noun', 'mark' ],
//  [ 'noun', 'verb', 'article', 'noun', 'mark' ]
//]
```


### 5. Visualization

When you use this library on the browser, the probability table and detailed prediction result can be shown using `genProbTable()` and `genViterbiResultTable()` respectively. \
These functions show the results as the html table format. 

```js
// assume using jQuery and output area '#prob-table' and '#viterbi-table' are prepared
$('#prob-table').html(hmm.genProbTable());
$('#viterbi-table').html(hmm.genViterbiResultTable());
```

## Demo

Open index.html in your browser.

**NOTE: This demo uses very old jQuery thus it might not work properly**

## LICENSE
The BSD 2-Clause License. See LICENSE.md file.
