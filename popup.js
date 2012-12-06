/** 
 * Groups user's recently visited pages into sessions.
 *
 */

// Open the link in a new tab of the current window.
var selected_icon;

function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}
function onFoldLinkClick(event) {
  var btn = event.srcElement;
  var parents = (btn.parentNode.parentNode.childNodes);
  var list;
  for(var s in parents){
    if(parents[s].className == "listDiv"){
      list = parents[s];
    }
  }
  if(list){
    if(list.id == "shown"){
      btn.innerText = "\u25BC";
      btn.id = "expand";
      list.id = "hidden";
      list.setAttribute("style", "display: none;");
    } else{
      btn.innerText = "\u25B2";
      btn.id = "collapse";
      list.id = "shown";
      list.setAttribute("style", "display: block;");      
    }
  }
  return false;
}
function onLineClick(event){
  var line = event.srcElement;
  var children = line.childNodes;
  var siblings = line.parentNode.childNodes;
  console.log(children);
  var mark;
  for(var s in children){
    if(children[s].className == "mark") {
      mark = children[s];
    }
  }
  if(mark){
    if(mark.id == ""){
      mark.style.background = "black";
      mark.id = "black";
      return false;
    }
    else {
      mark.style.background = "transparent";
      mark.id = "";
      return false;
    }
  }
  for(var s in siblings){
    if(siblings[s].className == "mark") {
      mark = siblings[s];
    }
  }
  if(mark){
    if(mark.id == ""){
      mark.style.background = "black";
      mark.id = "black";
      return false;
    }
    else {
      mark.style.background = "transparent";
      mark.id = "";
      return false;
    }
  }


  return false;
}
function lineHoverOver(event){
  var line = event.srcElement;
  var children = line.childNodes;
  var siblings = line.parentNode.childNodes;
  console.log(children);
  var mark;
  for(var s in children){
    if(children[s].className == "mark") {
      mark = children[s];
    }
  }
  if(mark && mark.id == ""){
    mark.style.backgroundColor = "white";
    mark.style.border = "1px solid black"; 
    return false;
  }
  for(var s in siblings){
    if(siblings[s].className == "mark") {
      mark = siblings[s];
    }
  }
  if(mark && mark.id == ""){
    mark.style.backgroundColor = "white";
    mark.style.border = "1px solid black"; 
    return false;
  }
  return false;
}
function lineHoverOut(event){
  var line = event.srcElement;
  var children = line.childNodes;
  var siblings = line.parentNode.childNodes;
  var mark;
  for(var s in children){
    if(children[s].className == "mark") {
      mark = children[s];
    }
  }
  if(mark && mark.id == ""){
    mark.style.backgroundColor = "transparent";
    mark.style.border = "none"; 
    return false;
  }
  for(var s in siblings){
    if(siblings[s].className == "mark") {
      mark = siblings[s];
    }
  }
  if(mark && mark.id == ""){
    mark.style.backgroundColor = "transparent";
    mark.style.border = "none";    
    return false;
  }
  return false;
}

function iconHoverOver(event){
  var icon = event.srcElement;
  if(icon.className != "selected"){
    icon.style.border = "1px solid black";
  }
}

function iconHoverOut(event){
  var icon = event.srcElement;
  if(icon.className != "selected"){
    icon.style.border = "";
  }
}

function onIconClick(event){
  var icon = event.srcElement;
  if(icon.className == "selected"){
    icon.className = "";
    icon.style.border = "";
    selected_icon = null;
  }
  else{
    if(selected_icon){
      selected_icon.className = "";
      selected_icon.style.border = "";
      selected_icon = icon;
    }
    icon.className = "selected";
    icon.style.border = "1px solid black";
    selected_icon = icon;
  }
}

function onHeaderClick(event){
  if(event.srcElement.className != "header") return false;
  if(selected_icon){
      selected_icon.className = "";
      selected_icon.style.border = "";
      selected_icon = null;
  }
}

// Given an array of historyItems, build lists of links for different sessions.
function buildPopupDom(divName, sessions) {
  
  var popupDiv = document.getElementById(divName);

  // var history = document.createElement('div');
  // popupDiv.appendChild(history);
  var date = new Date();
  
  // for every timed session.
  for (var i = 0, ie = sessions.length; i < ie; ++i) {
    var session = sessions[i];
    var timedSession = document.createElement('ul');
    if(date > session.start){
      date = new Date(new Date(session.start).setHours(0,0,0,0));
      var dateText = document.createElement('h3');
      dateText.appendChild(document.createTextNode(date.toLocaleDateString()));
      popupDiv.appendChild(dateText);
    }
    //timedSession.appendChild(document.createTextNode("Session from: ".concat(new Date(session.start).toLocaleTimeString().slice(0,5)))); //, " ~ ", new Date(session.end))));

    // var clusterList = document.createElement('div');

    for (var j = 0; j < session.clusters.length; j++){
	    
  	  var cluster = session.clusters[j];
      var listDiv = document.createElement('div');;
      listDiv.className += "listDiv";
  	  var clusterInDiv = document.createElement("div");
  	  for (var k = 0; k < cluster.length; k++){
        var historyItem = cluster[k];
  	    var titleDiv = document.createElement('div');


        var a = document.createElement('a');
        a.href = historyItem.url;
        if(historyItem.title == "") a.appendChild(document.createTextNode("(Untitled)"));
        else a.appendChild(document.createTextNode(historyItem.title));

        var hostDiv = document.createElement('div');
  	    hostDiv.appendChild(document.createTextNode(a.hostname));

  	    var timeDiv = document.createElement('div');
        timeDiv.appendChild(document.createTextNode(new Date(historyItem.lastVisitTime).toLocaleTimeString().slice(0,5)));
  	    // var dl = document.createElement('dl');
       //  dl.appendChild(document.createTextNode("alkefn"));
  	    // dl.appendChild(titleDiv);
  	    // dl.appendChild(hostDiv);
  	    // dl.className += "icon";
        // dl.className += "lineup";


        // var img = document.createElement('img');
        // img.wititleDivh = "20";
        // img.height = "20";
        // img.src = "http://" + a.hostname + "/favicon.ico" //"url('http://"+ a.hostname + "/favicon.ico')";
        //img.setAttribute("onerror", "this.src='/favicon.ico';");
        titleDiv.style.backgroundImage = "url('http://"+ a.hostname + "/favicon.ico')";
        titleDiv.className += "title";
        hostDiv.className += "host";
        timeDiv.className += "time";

        
        // a.appendChild(timeDiv);
        titleDiv.appendChild(a);
        a.addEventListener('click', onAnchorClick);

        var mark = document.createElement("button");
        // mark.addEventListener('click', onMarkClick);
        // mark.setAttribute("background", "transparent");
        mark.style.backgroundColor = "transparent";
        mark.style.border = "none";

        mark.className += "mark";
        // a.appendChild(document.createElement("br"));
        // a.appendChild(hostDiv);
        if(cluster.length > 1){
          if(k == 0) {
            listDiv = document.createElement('div');
            listDiv.className += "listDiv";
          }
    	    var li = document.createElement('li');
          li.appendChild(mark);
          li.appendChild(timeDiv);
    	    li.appendChild(titleDiv);
          li.appendChild(hostDiv);
          li.className += "line";
          li.addEventListener('mouseover', lineHoverOver);
          li.addEventListener('mouseout', lineHoverOut);
          li.addEventListener('click', onLineClick);
          listDiv.appendChild(li);
          listDiv.id = "hidden";
          listDiv.setAttribute("style", "display: none;")
        } else {
          clusterInDiv.appendChild(mark);
          clusterInDiv.appendChild(timeDiv);
          clusterInDiv.appendChild(titleDiv);
          clusterInDiv.appendChild(hostDiv);
          clusterInDiv.addEventListener('mouseover', lineHoverOver);
          clusterInDiv.addEventListener('mouseout', lineHoverOut);
          clusterInDiv.addEventListener('click', onLineClick);
          clusterInDiv.className += "line";
        }
  	  }

      if(cluster.length > 1){
        var lineDiv = document.createElement('div');
        lineDiv.appendChild(mark);
        lineDiv.appendChild(timeDiv);
        lineDiv.appendChild(titleDiv);
        lineDiv.appendChild(hostDiv);
        lineDiv.className += "line";
        // lineDiv.className += "lineDiv";
        var fold_link = document.createElement("button");
        // fold_link.href = "#!";
        fold_link.addEventListener('click', onFoldLinkClick);
        fold_link.appendChild(document.createTextNode("\u25BC"));
        fold_link.className += "fold_link";
        fold_link.id = "expand";
        //fold_link.appendChild(document.createElement("br"));
        // var clusterOutDiv = document.createElement("div");
        lineDiv.appendChild(fold_link);
        clusterInDiv.appendChild(lineDiv);
        clusterInDiv.appendChild(listDiv);
      }

  	  // clusterOutDiv.appendChild(clusterInDiv);
  	  timedSession.appendChild(clusterInDiv);
      popupDiv.id = "clusterExpander";

      // history.setAttribute("data-collapse");

    }

    // timedSession.appendChild(clusterList);
    timedSession.className += "timedSession";

    popupDiv.appendChild(timedSession);

  }

  // icons for groups
  var iconDiv = $('.group_icons')[0];
  var headerDiv = $('.header')[0];
  headerDiv.addEventListener('click', onHeaderClick);
  var icons = iconDiv.childNodes;
  console.log(iconDiv);
  for(var g in icons){
    console.log(g.src);
    var icon = icons[g];
    icon.addEventListener('mouseover', iconHoverOver);
    icon.addEventListener('mouseout', iconHoverOut);
    icon.addEventListener('click', onIconClick);
  }

}
 
var DOMAINS = ["www","com","org","edu","net", "", "html", "htm"];

// returns dictionary of the url (term -> frequency)
//TODO
function parse(url, title) {
  title = title.split(/\W/g).filter(function(s){return s.length});
  url = decodeURIComponent(url.replace(/\+/g, " "));
  url = url.replace(/http:\/\//gi,"").replace(/https:\/\//gi,"");
  var parsed = 
    title.concat(url.split(/\W/g)).filter(function(term) {
                                      return (term.length > 1) 
                                          && (DOMAINS.indexOf(term) == -1);
                                    });
  parsed = parsed.map(stemmer).map(function(w) { return w.toLowerCase(); });
  //console.log(parsed);
  var dict = {};
  parsed.map(function(term){
               if(!dict[term]) dict[term] = 1;
               else dict[term]++;
             });

  return dict;
}

function buildDocuments(historyItems) {
  var urls = historyItems.map(function(hi){ return hi.url; })
  //console.log("urls:");
  //console.debug(urls);
  var titles = historyItems.map(function(hi){ return hi.title; })
  var d;
  var termToIndex = {}; // (term -> index in vector)
  var termToFreqs = {};
  var docs = [];
  var total = 0; // total number of terms
  // parse each url and build docs & termToIndex.
  // docs: array of parsed dictionaries
  // termToIndex: dictionary mapping from term to index in vector
  for (var i in historyItems) {
    d = parse(urls[i], titles[i]);
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
  
  var vectors = []; // vectors.length == total
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
  //console.log(vectors);
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

	//console.log(simMatrix);
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
  //console.debug(clusterHierarchy);
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
      clusters[clusterIndex] = [k];
    }
    else {
      clusters[clusterIndex].push(k);
    }
  }
  
  // labeling start
  for (var c in clusters){
    var cluster = clusters[c]; // array of indices
    var freq = {};
    cluster = cluster.map(function(i) { return docs[i];});
    cluster.map(
      function(dict){
        for(var k in dict){
          if(freq[k]) freq[k]+=dict[k];
          else freq[k] = dict[k];
        }
      });
    var mostFreq = {term: "", freq: 0};
    for(var k in freq){
      if(freq[k] >= mostFreq.freq){
        mostFreq.term = k;
        mostFreq.freq = freq[k];
      }
    }
    label = mostFreq.term;
  }
  // labeling end

  console.log(clusters);
  // array of clusters where cluster is an array of urls
  var result = [];
  for(var c in clusters){
    var cluster = clusters[c];
    if(cluster.length > 0){
      cluster = cluster.map(function(i) { return historyItems[i];});
    } else{
      cluster.push(historyItems[c]);
    }
    result.push(cluster);
  }
  console.log(result);
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
        buildSession(historyItems[i]);
      }
      //console.log("lets print whats in history\n");
      //console.log(sessions);
	  sessions.map(
		function(session){
			session["clusters"] = buildDocuments(session.historyItems);
		});
      // urls.push(historyItems[i].url);
      //       clusters = buildDocuments(urls);
      console.log(sessions);
      buildPopupDom(divName, sessions);
    });

  /* Assign a historyItem to corresponding session.
   *
   * Examine time gap between activities.
   * Two adjacent activities are counted in two different
   * sessions if the time between them exceeds some threshold,
   * in this case, 15 minutes.
   *
   * Assumes that historyItem does not belong to any previous sessions
   * (sessions[0 ~ currSessionIndex-1]).
   */
  function buildSession(historyItem) {
    var visitTime = historyItem.lastVisitTime;

    var sessionInterval = 1000 * 60 * 15; // 15 minutes
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
