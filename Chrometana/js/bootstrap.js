var custom_engine;
var storageChange;
var enable_open_website;
var debugging = false;
function convertURL(url){
    log("convertURL");
    log(url);
    url = url.replace(/%20/g,"+");
    var uri = /\?q\=([0-9a-zA-Z-._~:\/?#[\]@!$'()*+,;=%]*)($|(\&))/.exec(url)[1];
    log("url: " + url);
    log("uri: " + uri);
    log("StorageChange: " + storageChange);
    log("enable_open_website: " + enable_open_website);
    if(enable_open_website === true){
        var match = /^((go\+to\+)|(open\+)|())([0-9a-zA-Z-._~:\/?#[\]@!$'()*+,;=%]*\.[a-z]+)/i.exec(uri);
        log("match: ");
        log(match);
        if(match){
            return "http://" + match[5];
        }
    }
    if(storageChange == "Google.com"){
        return "https://www.google.com/search?q=" + uri;
    }
    if(storageChange == "DuckDuckGo.com"){
        return "https://www.duckduckgo.com?q=" + uri;
    }
    if(storageChange == "Yahoo.com"){
        return "https://search.yahoo.com/search?p=" + uri;
    }
    if(storageChange == "Custom"){
        return custom_engine + uri;
    }
    return "https://www.google.com/search?q=" + uri;
}
chrome.storage.sync.get(['search_engine','custom_engine','enable_open_website'], function (obj) {
    log("obj:");
    log(obj);
    storageChange = obj.search_engine;
    enable_open_website = obj.enable_open_website;
    if(storageChange == "Custom"){
        custom_engine = obj.custom_engine;
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {  
    log("changes: ");
    log(changes);
    if(typeof changes.search_engine !== "undefined"){
        storageChange = changes.search_engine.newValue;
    } 
    if(storageChange == "Custom"){
        if(typeof changes.custom_engine !== "undefined"){
            custom_engine = changes.custom_engine.newValue;
        }
    }
    if(typeof changes.enable_open_website !== "undefined"){
        enable_open_website = changes.enable_open_website.newValue;
    } 
    log("storageChange: " + storageChange);
    log("custom_engine: " + custom_engine);
    log("enable_open_website: " + enable_open_website);
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
   	log("storageChange: " + storageChange);
    log("details:");
    log(details);
    return { redirectUrl: convertURL(details.url)};
}, {urls: ["*://*.bing.com/search*"]}, ["blocking"]);

// Redirect to welcome.html on install
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({url: "html/options.html?newinstall=yes"});
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
// Fallback when Chrome is not already running
chrome.runtime.onMessage.addListener(onMessage);
function onMessage(request, sender, callback) {
    if (request.action == "convertURL") {
        callback(convertURL(request.url));
    }
    return true;
}
function log(txt) {
    if(debugging) {
      console.log(txt);
    }
}
