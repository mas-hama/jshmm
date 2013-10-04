jshmm
=====

JSHMM(very tiny HMM in JavaScript)

This program is a very tiny HMM program in JavaScript.

[USAGE]

//
// create a HMM object 
//
var hmm = new HMM(); 

//
// Set training data with the method "setTrainingData(trainingStr)".
// "trainingStr" format ... each line is "<observation> <label>"
//
hmm.setTrainingData(trainingStr); 

//
// Predict with the function "predictLabels(testStr)".
// This function alerts predicted labels.
// "testStr" format ... each line is a single observation
//
hmm.predictLabels(testStr);

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


Copyright (c) 2013, Masafumi Hamamoto
All rights reserved.
