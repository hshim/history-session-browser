/** 
 * Groups user's recently visited pages into sessions.
 *
 * Reads history up to one week from now. 
 * But limits total number of pages read to 200.
 */

// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of historyItems, build lists of links for different sessions.
function buildPopupDom(divName, sessions) {
  var popupDiv = document.getElementById(divName);

  var ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (var i = 0, ie = sessions.length; i < ie; ++i) {
    var session = sessions[i];
    var newSessionList = document.createElement('li');
    newSessionList.appendChild(document.createTextNode("Session from: ".concat(new Date(session.start), " ~ ", new Date(session.end))));
    var newURLList = document.createElement('ul');
    /*
    for (var j = 0; j < session.historyItems.length; j++){
      var a = document.createElement('a');
      a.href = session.historyItems[j].url;
      a.appendChild(document.createTextNode(session.historyItems[j].title));
      a.addEventListener('click', onAnchorClick);
      var li = document.createElement('li');
      li.appendChild(a);
      newURLList.appendChild(li);
    }*/
    for (var j = 0; j < session.length; j++){
      var a = document.createElement('a');
      a.href = session[j];
      a.appendChild(document.createTextNode(session[j]));
      a.addEventListener('click', onAnchorClick);
      var li = document.createElement('li');
      li.appendChild(a);
      newURLList.appendChild(li);
    }
    newSessionList.appendChild(newURLList);
    ul.appendChild(newSessionList);
  }
}
 
var DOMAINS = ["www","com","org","edu","net", "", "html", "htm"];

// returns dictionary of the url (term -> frequency)
function parse(url) {
  url = decodeURIComponent(url.replace(/\+/g, " "));
  url = url.replace(/http:\/\//gi,"").replace(/https:\/\//gi,"");
  var parsed = 
    url.split(/[.\-\_\/&=?~ ]/).filter(function(term) {
                                      return (term.length > 1) 
                                          && (DOMAINS.indexOf(term) == -1);
                                    });
  parsed = parsed.map(stemmer).map(function(w) { return w.toLowerCase(); });
  console.log(parsed);
  var dict = {};
  parsed.map(function(term){
               if(!dict[term]) dict[term] = 1;
               else dict[term]++;
             });

  return dict;
}

function buildDocuments(urls) {
  var d;
  var termToIndex = {}; // (term -> index in vector)
  var termToFreqs = {};
  var docs = [];
  var total = 0;
  // parse each url and build docs & termToIndex.
  // docs: array of parsed dictionaries
  // termToIndex: dictionary mapping from term to index in vector
  for (var i in urls) {
    d = parse(urls[i]);
    docs.push(d);
    for(var term in d){
      termToIndex[term] = 0;
      if(!termToFreqs[term]) {
        termToFreqs[term] = 1;
      }
      else {
        termToFreqs[term] = termToFreqs[term]+1;
      }
    }
  }
  // calculate total number of terms and assign indexes for each term. 
  for (var term in termToIndex) {
    termToIndex[term]= total++;
  }

  //debug start
  var freqs = [];
  for(var t in termToIndex) {
    freqs.push(termToFreqs[t]);
  }
  freqs.sort(function(a,b) { return b-a; });
  freqs = freqs.map(function(freq){
                      for(var t in termToFreqs){
                        if(termToFreqs[t] == freq) {
                          termToFreqs[t] = false;
                          return t.concat(" : ", freq);
                        }
                      }
                      return t.concat(" : not found");
                    });
  //debug end
  
  var vectors = []; // size == total
  var i=0;
  for (var k = 0; k < docs.length; k++) {
    var doc = docs[k];
    var vector = [];
    for (var j = 0 ; j < total ; j++) {
      vector[j] = 0;
    }
    var norm = 0;
    // build vector for ith doc.
    for (var term in doc) {
      var weight = doc[term];
      vector[termToIndex[term]] = weight;
      norm += weight * weight;
    }
    // normalize
    norm = Math.sqrt(norm);
    for (var j = 0 ; j < vector.length; j++) {
      vector[j] = vector[j]/norm;
    }
    vectors[i++] = vector;
  }  // done creating vectors.

  // build clusters
  var liveClusters = [];
  for (var j = 0 ; j < vectors.length; j++){
    liveClusters.push(true);
  } // initially, each vector is a cluster
  
  // build sim matrix
  var simMatrix = [];
  for (var i = 0; i < vectors.length; i++){
    var simFromi = [];
    for (var j = 0; j < vectors.length ; j++){
      simFromi[j] = sim(vectors[i], vectors[j]);
    }
    simMatrix[i] = simFromi;
  }

  // clusters[i] is array of all indices of vectors it shares cluster with.
  // clusterHierarchy maps index of vector to index of vector it shares cluster with,
  //   but it only keeps track of those with similarity level greater than or equal to simLevel.
  // initialize clusters and clusterHierarchy. 
  var clusters = [];
  var clusterHierarchy = {};
  var simLevel = 0.35;
  for (var i = 0 ; i < simMatrix.length; i++){
    clusters[i] = [i];
    clusterHierarchy[i] = i;
  }
  var maxSim = {vector1:0, vector2:1, sim:simMatrix[0][1]};

  // start clustering process. 
  // each iteration merges two clusters into one.
  for (var iter = 0; iter < simMatrix.length - 1; iter++){
    // get the vectors that are most similar.
    maxSim = {vector1:-1, vector:-1, sim:0};
    for (var i = 0; i < simMatrix.length; i++){
      for (var j = 0; j < simMatrix.length; j++){
        if((i!=j) && liveClusters[i] && liveClusters[j] && simMatrix[i][j] >= maxSim.sim){
          maxSim = {vector1:i, vector2:j, sim:simMatrix[i][j]};
        }
      }
    }

    // add to cluster hierarchy if two vectors are similar enough.
    if(maxSim.sim >= simLevel){
      clusterHierarchy[maxSim.vector2] = maxSim.vector1;
    }

    clusters[maxSim.vector1] = clusters[maxSim.vector1].concat(clusters[maxSim.vector2]);
    clusters[maxSim.vector2] = clusters[maxSim.vector2].concat(clusters[maxSim.vector1]);
    for (var i = 0 ; i < simMatrix.length ; i++){
      simMatrix[maxSim.vector1][i] = clusters[maxSim.vector1].map(
      function(v) {
        return sim(vectors[v], vectors[i]);
      }).reduce(function(s1, s2) { return Math.max(s1, s2); });
        
      simMatrix[i][maxSim.vector1] = simMatrix[maxSim.vector1][i];
    }
    liveClusters[maxSim.vector2] = false;
  }

  // build clusters to be returned.
  // clusters maps index of one vector in a cluster
  //   to indices of vectors that are in the same cluster.
  clusters = {};
  for(var k in clusterHierarchy){
    var clusterIndex = k;
    while(clusterHierarchy[clusterIndex] != clusterIndex){
      clusterIndex = clusterHierarchy[clusterIndex];
    }
    if(!clusters[clusterIndex]) {
      clusters[clusterIndex] = [];
    }
    else {
      clusters[clusterIndex].push(k);
    }
  }

  var result = [];
  for(var c in clusters){
    var cluster = clusters[c];
    if(cluster.length > 0){
      cluster = cluster.map(function(i) { return urls[i]; });
    } else{
      cluster.push(urls[c]);
    }
    result.push(cluster);
  }
  return result;
}


// measures similarity bt. two docs.
function sim(a, b) {
  var dotProduct = 0;
  var normA = 0;
  var normB = 0;
  for(var i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i]; 
  }
  if(dotProduct == 0) return 0;
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  var sim =  dotProduct / (normA * normB);
  sim = Math.round(sim * 1000) / 1000;
  return sim;
}

// Porter stemmer in Javascript. Few comments, but it's easy to follow against the rules in the original
// paper, in
//
//  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
//  no. 3, pp 130-137,
//
// see also http://www.tartarus.org/~martin/PorterStemmer

// Release 1 be 'andargor', Jul 2004
// Release 2 (substantially revised) by Christopher McKenzie, Aug 2009

var stemmer = (function(){
	var step2list = {
			"ational" : "ate",
			"tional" : "tion",
			"enci" : "ence",
			"anci" : "ance",
			"izer" : "ize",
			"bli" : "ble",
			"alli" : "al",
			"entli" : "ent",
			"eli" : "e",
			"ousli" : "ous",
			"ization" : "ize",
			"ation" : "ate",
			"ator" : "ate",
			"alism" : "al",
			"iveness" : "ive",
			"fulness" : "ful",
			"ousness" : "ous",
			"aliti" : "al",
			"iviti" : "ive",
			"biliti" : "ble",
			"logi" : "log"
		},

		step3list = {
			"icate" : "ic",
			"ative" : "",
			"alize" : "al",
			"iciti" : "ic",
			"ical" : "ic",
			"ful" : "",
			"ness" : ""
		},

		c = "[^aeiou]",          // consonant
		v = "[aeiouy]",          // vowel
		C = c + "[^aeiouy]*",    // consonant sequence
		V = v + "[aeiou]*",      // vowel sequence

		mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
		meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
		mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
		s_v = "^(" + C + ")?" + v;                   // vowel in stem

	return function (w) {
		var 	stem,
			suffix,
			firstch,
			re,
			re2,
			re3,
			re4,
			origword = w;

		if (w.length < 3) { return w; }

		firstch = w.substr(0,1);
		if (firstch == "y") {
			w = firstch.toUpperCase() + w.substr(1);
		}

		// Step 1a
		re = /^(.+?)(ss|i)es$/;
		re2 = /^(.+?)([^s])s$/;

		if (re.test(w)) { w = w.replace(re,"$1$2"); }
		else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }

		// Step 1b
		re = /^(.+?)eed$/;
		re2 = /^(.+?)(ed|ing)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			re = new RegExp(mgr0);
			if (re.test(fp[1])) {
				re = /.$/;
				w = w.replace(re,"");
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1];
			re2 = new RegExp(s_v);
			if (re2.test(stem)) {
				w = stem;
				re2 = /(at|bl|iz)$/;
				re3 = new RegExp("([^aeiouylsz])\\1$");
				re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
				if (re2.test(w)) {	w = w + "e"; }
				else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
				else if (re4.test(w)) { w = w + "e"; }
			}
		}

		// Step 1c
		re = /^(.+?)y$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(s_v);
			if (re.test(stem)) { w = stem + "i"; }
		}

		// Step 2
		re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step2list[suffix];
			}
		}

		// Step 3
		re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step3list[suffix];
			}
		}

		// Step 4
		re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
		re2 = /^(.+?)(s|t)(ion)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			if (re.test(stem)) {
				w = stem;
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1] + fp[2];
			re2 = new RegExp(mgr1);
			if (re2.test(stem)) {
				w = stem;
			}
		}

		// Step 5
		re = /^(.+?)e$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			re2 = new RegExp(meq1);
			re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
			if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
				w = stem;
			}
		}

		re = /ll$/;
		re2 = new RegExp(mgr1);
		if (re.test(w) && re2.test(w)) {
			re = /.$/;
			w = w.replace(re,"");
		}

		// and turn initial Y back to y

		if (firstch == "y") {
			w = firstch.toLowerCase() + w.substr(1);
		}

		return w;
	}
})();

// main
function buildUrlList(divName) {
  var pgLimit = parseInt(localStorage["num_pg_limit"]);
  var startTime = parseInt(localStorage["start_time"]);
  var microsecondsPerDay = 1000 * 60 * 60 * 24;
  var microsecondsPerWeek = microsecondsPerDay * 7;
  startTime = (new Date).getTime() - microsecondsPerWeek * startTime;
  var currSessionIndex = 0;
  var sessions = [];
  var urls = [];

  // get user's history
  chrome.history.search({
      'text': '',
      'startTime': startTime,
      'maxResults': pgLimit
    },
    // Build array of sessions from each page in user's history.
    function(historyItems) {
      //console.log("Num history Items: ".concat(historyItems.length, "\n"));
      for (var i = 0; i < historyItems.length; ++i) {
        // Initialize the first session.
        if(!sessions.length) {
          var newSession = {start:historyItems[i].lastVisitTime,
                            end:historyItems[i].lastVisitTime, 
                            historyItems:[historyItems[i]]};
          sessions.push(newSession);
          continue;
        }
        urls.push(historyItems[i].url);
        buildSession(historyItems[i]);
      }

      //console.log("lets print whats in history\n");
      //console.log(sessions);
      
      sessions = buildDocuments(urls);
      buildPopupDom(divName, sessions);
    });

  /* Assign a historyItem to corresponding session.
   *
   * Examine time gap between activities.
   * Two adjacent activities are counted in two different
   * sessions if the time between them exceeds some threshold,
   * in this case, 10 minutes.
   *
   * Assumes that historyItem does not belong to any previous sessions
   * (sessions[0 ~ currSessionIndex-1]).
   */
  function buildSession(historyItem) {
    var visitTime = historyItem.lastVisitTime;

    var sessionInterval = 1000 * 60 * 10; // 10 minutes
    var session = sessions[currSessionIndex];
    var sessionStart = session.start;
    // Build new session if the page needs one.
    if(sessionStart - sessionInterval > visitTime) {
      var newSession = {start:visitTime, 
                        end:visitTime, 
                        historyItems:[historyItem]};
      sessions.push(newSession);
      currSessionIndex++;
    }
    else {
      session.historyItems.push(historyItem);
      session.start = historyItem.lastVisitTime;
    }
  }

}

document.addEventListener('DOMContentLoaded', function () {
  buildUrlList("typedUrl_div");
});
