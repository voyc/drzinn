/*
// scoring
the 80 questions each have a value from 1 thru 7
score reduces to 
7 areas, each with a Raw Score and a T-Score, each with a value of 0 thru 100.
T-Score is shown on the graphs
plus an 8th factor, "Impression Management", "The number of socially desirable responses provided by Mr. Hagstrand is within the expected range."

// graphing
a bar graph with 7 bars?

voyc.data.quizz['eji'] = {
title:'Emotional Judgement Inventory (EJI)',
copyright:'ipat',
directions:'80 questions.  Answer 1 to 7, disagree-not sure-agree',
test: [
{n:1,  r:0, q:'', a:[
{v:1, t:'1 I Absolutely Disagree'},
{v:2, t:'2 I Strongly Disagree'},
{v:3, t:'3 I Slightly Disagree'},
{v:4, t:'4 Not Sure'},
{v:5, t:'5 I Slightly Agree'},
{v:6, t:'6 I Strongly Agree'},
{v:7, t:'7 I Absolutely Agree'},
]},
{n:1,  r:0, q:'', a:[
{v:1, t:'1 I Absolutely Disagree'},
{v:2, t:'2 I Strongly Disagree'},
{v:3, t:'3 I Slightly Disagree'},
{v:4, t:'4 Not Sure'},
{v:5, t:'5 I Slightly Agree'},
{v:6, t:'6 I Strongly Agree'},
{v:7, t:'7 I Absolutely Agree'},
]},

]}
*/

voyc.data.quizz['eji'] = {
title:'Emotional Judgement Inventory (EJI)',
//copyright:'© Copyright 2000, 2003 OPP® Limited, Elsfield Hall, 15-17 Elsfield Way, Oxford OX2 8EP, UK. All rights reserved.',
copyright:'Provided by IPAT.',
directions:'This test is a product offered by ipat, a commercial testing company.  ipat charges $60 to administer this test.  To schedule the test, contact Dr. Zinn at 847 236 4712, and make arrangements for payment.\nAfter taking the test, IPAT will provide you with your Emotional Judgement Inventory Report.  At the bottom of the last page of this report you will see a short table of "Scales".\nEnter the "T-Score" for each "Scale" into the form below.',
answertype: 'pct',
test: [
{n:1,  r:0, q:'AW', a:[]},
{n:2,  r:0, q:'IS', a:[]},
{n:3,  r:0, q:'IO', a:[]},
{n:4,  r:0, q:'MS', a:[]},
{n:5,  r:0, q:'MO', a:[]},
{n:6,  r:0, q:'PS', a:[]},
{n:7,  r:0, q:'EX', a:[]},
{n:8,  r:0, q:'IM', a:[]},
]}
