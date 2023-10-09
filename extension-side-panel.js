let openedIframe = null; // Keep track of the currently opened iframe
console.log('-------- loaded the extension-side-panel.js content script!  ---------');

const targetUrl = 'chrome-extension://iloenilpfodogjfhidgmandidjcmlkam/temp-frame.html';
const currentURL = window.location.href;

if (currentURL === targetUrl) {
  generateSidePanel();
}

// // Send the id of this tab to the background.js file so we can communicate with this page to open the initial iFrame
// chrome.runtime.sendMessage({ action: "getSidePanelTabId" }, function(response) {
//   console.log('response from background --------------------', response);
//   if (response && response.tabId) {
//     const tabId = response.tabId;
//     console.log("Tab ID from content script:", tabId);
//   } else if (response.message) {

//   }
// });

chrome.runtime.onMessage.addListener((message) => {
  console.log('incoming message into your content script??');
  console.log('message: ', message);
  if (message === "toggle") {
    console.log("toggling side panel");
    generateSidePanel();
  } else if (message === "closeSidePanel") {
    closeSidePanel();
  }
  if (message === "toggleNewTab") {
    console.log("toggling new tab side panel");
    generateSidePanel();
  }
});

// Function to handle clicks outside of the iframe
function closeSidePanel(event) {
  console.log('openedIframe: ', openedIframe);
  // Check if the clicked element is not inside the iframe
  console.log(openedIframe);
  if (openedIframe) {
    // Remove the iframe from the document
    document.body.removeChild(openedIframe);
    openedIframe = null; // Clear the iframe reference
  }
}

// Add a click event listener to the window to close it when we click outside of it
window.addEventListener("click", closeSidePanel);


//TODO:CHROME - Styling changes will need to be made here for the side window, we may not be keeping it at 100%
function createIframe(url) {
  var iframe = document.createElement('iframe');
  iframe.style.background = "#f4f4f4"; // Light grey background
  iframe.style.border = "2px solid #888"; // Medium gray border
  iframe.style.boxShadow = "0px 2px 6px rgba(0, 0, 0, 0.1)"; // Drop shadow for modern appearance
  iframe.style.height = "100%";
  iframe.style.width = "0px";
  iframe.style.position = "fixed";
  iframe.style.top = "0px";
  iframe.style.right = "0px";
  iframe.style.zIndex = "9000000000000000000";
  iframe.src = url;
  document.body.appendChild(iframe);
  return iframe;
}

function generateSidePanel() {
  console.log('inside of reveal side panel function');
  // create the side panel iFrame using the helper function above
  openedIframe = createIframe(chrome.runtime.getURL("extension-content-frame.html"));
  openedIframe.style.width = "450px";
  // Define the message you want to send
  const message = "Hello from the parent window!";

  //TODO:CHROME - Is there anything happening here of importance? Might be useful going forward.
  openedIframe.contentWindow.postMessage(message, "*");
}