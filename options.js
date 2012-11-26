// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var num_pg_select = document.getElementById("num_pg_limit");
  var num_pg_limit = num_pg_select.children[num_pg_select.selectedIndex].value;
  localStorage["num_pg_limit"] = num_pg_limit;

  var start_select = document.getElementById("start_time");
  var start_time = start_select.children[start_select.selectedIndex].value;
  localStorage["start_time"] = start_time;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  /*setTimeout(function() {
    status.innerHTML = "";
  }, 750);*/
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var num_pg = localStorage["num_pg_limit"];
  if (!num_pg) {
    return;
  }
  var num_pg_select = document.getElementById("num_pg_limit");
  for (var i = 0; i < num_pg_select.children.length; i++) {
    var child = num_pg_select.children[i];
    if (child.value == num_pg) {
      child.selected = "true";
      break;
    }
  }
  var start_time = localStorage["start_time"];
  if (!start_time) {
    return;
  }
  var start_select = document.getElementById("start_time");
  for (var i = 0; i < start_select.children.length; i++) {
    var child = start_select.children[i];
      if (child.value == start_time) {
        child.selected = "true";
        break;
      }
  }
}
//document.addEventListener('DOMContentReady', restore_options);
//document.querySelector('save').addEventListener('click', save_options);
//console.log(document.getElementById("save"));
document.addEventListener('DOMContentLoaded', function (){
    restore_options();
    document.querySelector('#save').addEventListener('click', save_options);  
    });
