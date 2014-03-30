jshmm
=====

JSHMM(very tiny HMM in JavaScript)

This program is a very tiny HMM program in pure JavaScript.
Any other library is not required.

[version]

0.1.0

[Demo]

See index.html

[Detail Usage]

//
// Create a HMM object 
//
var hmm = new HMM(); 

// or, you can create an object for Node.js in the following manner;
// var hmm = require("jshmm.js").createHMM();

//
// Set training data with the method "setTrainingData(trainingStr)".
//
// ["trainingStr" format]
//  trainingStr is a string value consists of one or more sequences and the boundary of each sequence is an empty line.
//  Each line in a sequence consists of two tokens 'observation' and 'label'.  'observation' and 'label' are separated by one or more white spaces.
//
hmm.setTrainingData(trainingStr); 

//
// Predict with the function "predictLabels(testStr)".
// This function alerts predicted labels.
//
// "testStr" format is almost same as "trainingStr" without any labels.
//
var predResult = hmm.predictLabels(testStr);

// predictLabels returns as an two-dimentional array; predResult[i][j] is the predicted label of the j-th observation in the i-th sequence

//
// You can show the probability table and detailed prediction 
// result by the functions "genProbTable()" and
// "genViterbiResultTable()", respectively.
// These functions show the results as the html table format. 
//
$('#prob-table').html(hmm.genProbTable());
$('#viterbi-table').html(hmm.genViterbiResultTable());

[LICENSE]
The BSD 2-Clause License. See LICENSE.md file.


Copyright (c) 2013, 2014, Masafumi Hamamoto
All rights reserved.
