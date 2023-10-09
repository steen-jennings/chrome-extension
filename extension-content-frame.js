// Listen for message from application (iframe)
window.addEventListener("message", function(event) {
  // save the CSRF token generated in bearoku iFrame after auth
  if (event.data && typeof event.data === "object" && "csrfToken" in event.data) {
    const csrfToken = event.data.csrfToken;
    
    //TODO:CHROME - we will need to add an expiry of sorts here to validate if we need to refresh the
    // Save csrfToken to Chrome local storage for use verifying session later
    chrome.storage.local.set({ csrfToken: csrfToken }, function() {
      if (chrome.runtime.lastError) {
        console.error("Error saving csrfToken to local storage:", chrome.runtime.lastError);
      } else {
        console.log("csrfToken saved to local storage:", csrfToken);
      }
    });
  }
  // This listens for the iFrame button "create invite", once clicked, we verify access and open a new iFrame
  if (event.data === 'clicked EMT Button!') {
    // Send a message to the background script to trigger the desired action
    chrome.runtime.sendMessage({ action: 'openEMTWindow' });
  }
});