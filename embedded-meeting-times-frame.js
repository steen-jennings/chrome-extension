// // Send the id of this tab to the background.js file so we can communicate with this page to open the initial iFrame
// chrome.runtime.sendMessage({ action: "getTabId" }, function(response) {
//   if (response && response.tabId) {
//     const tabId = response.tabId;
//     console.log("Tab ID from content script:", tabId);
//   }
// });

// Listen for message from application (iframe) when it opens
window.addEventListener("message", function(event) {
  if (event.data.message == 'IFRAME_LOADED') {
    // Reference to the iframe element to respond in messaging port
    const iframe = document.getElementById('myIframe');

    // fetch the CSRF token from local storage, it should exist if the iFrame is messaging us
    chrome.storage.local.get('csrfToken', function(result) {
      csrfToken = result.csrfToken;
      if (chrome.runtime.lastError) {
        console.error("Error retrieving csrfToken from local storage:", chrome.runtime.lastError);
      } else {
        const message = {
          data: {
            csrfToken: csrfToken,
          },
          message: 'CSRF_TOKEN'
        }
        console.log('message: ', message);
        iframe.contentWindow.postMessage(message, '*');
      }
    });
  }
});


